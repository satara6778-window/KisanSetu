package com.kisansetu.service;

import com.kisansetu.config.PlatformConfig;
import com.kisansetu.dto.CounterOfferRequest;
import com.kisansetu.dto.OfferCreateRequest;
import com.kisansetu.dto.OfferResponse;
import com.kisansetu.entity.*;
import com.kisansetu.exception.InsufficientStockException;
import com.kisansetu.exception.ResourceNotFoundException;
import com.kisansetu.exception.UnauthorizedOperationException;
import com.kisansetu.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final CropListingRepository cropListingRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PlatformConfig platformConfig;
    private final AuditService auditService;

    public OfferService(OfferRepository offerRepository,
                        CropListingRepository cropListingRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        PlatformConfig platformConfig,
                        AuditService auditService) {
        this.offerRepository = offerRepository;
        this.cropListingRepository = cropListingRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.platformConfig = platformConfig;
        this.auditService = auditService;
    }

    @Transactional
    public OfferResponse createOffer(User buyer, OfferCreateRequest request) {
        CropListing listing = cropListingRepository.findById(request.listingId())
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + request.listingId()));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new InsufficientStockException("This listing is not currently active for offers.");
        }

        if (buyer.getId().equals(listing.getFarmer().getId())) {
            throw new IllegalArgumentException("Cannot send offers to your own listing.");
        }

        if (listing.getAvailableQuantity().compareTo(request.quantity()) < 0) {
            throw new InsufficientStockException("Requested quantity exceeds available stock of " + listing.getAvailableQuantity() + " " + listing.getUnit());
        }

        Offer offer = new Offer();
        offer.setListing(listing);
        offer.setBuyer(buyer);
        offer.setFarmer(listing.getFarmer());
        offer.setOfferedPrice(request.offeredPrice());
        offer.setQuantity(request.quantity());
        offer.setStatus(OfferStatus.PENDING);
        offer.setBuyerNotes(request.notes());

        offer = offerRepository.save(offer);
        auditService.log("OFFER_CREATE", buyer.getPhone(), "Offer", offer.getId().toString(),
                "Buyer offered ₹" + request.offeredPrice() + "/" + listing.getUnit() + " for " + request.quantity() + " " + listing.getUnit());

        return OfferResponse.fromEntity(offer);
    }

    @Transactional
    public OfferResponse counterOffer(User farmer, Long offerId, CounterOfferRequest request) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + offerId));

        if (!offer.getFarmer().getId().equals(farmer.getId()) && farmer.getRole() != Role.ADMIN) {
            throw new UnauthorizedOperationException("Only the seller farmer can make a counter-offer.");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new IllegalStateException("Only pending offers can be countered (current status: " + offer.getStatus() + ").");
        }

        offer.setCounterPrice(request.counterPrice());
        offer.setStatus(OfferStatus.COUNTERED);
        offer.setFarmerNotes(request.notes());

        offer = offerRepository.save(offer);
        auditService.log("OFFER_COUNTER", farmer.getPhone(), "Offer", offer.getId().toString(),
                "Farmer countered with ₹" + request.counterPrice());

        return OfferResponse.fromEntity(offer);
    }

    @Transactional
    public OfferResponse acceptOffer(User user, Long offerId) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + offerId));

        boolean isFarmer = offer.getFarmer().getId().equals(user.getId());
        boolean isBuyer = offer.getBuyer().getId().equals(user.getId());

        BigDecimal agreedPrice;

        if (offer.getStatus() == OfferStatus.PENDING) {
            // Farmer accepting buyer's initial offer
            if (!isFarmer && user.getRole() != Role.ADMIN) {
                throw new UnauthorizedOperationException("Only the seller farmer can accept an initial offer.");
            }
            agreedPrice = offer.getOfferedPrice();
        } else if (offer.getStatus() == OfferStatus.COUNTERED) {
            // Buyer accepting farmer's counter offer
            if (!isBuyer && user.getRole() != Role.ADMIN) {
                throw new UnauthorizedOperationException("Only the buyer can accept a counter-offer.");
            }
            agreedPrice = offer.getCounterPrice();
        } else {
            throw new IllegalStateException("Offer cannot be accepted in current state: " + offer.getStatus());
        }

        CropListing listing = offer.getListing();

        // Atomic stock reduction for negotiated order
        int updatedRows = cropListingRepository.reduceStockAtomically(listing.getId(), offer.getQuantity());
        if (updatedRows == 0) {
            throw new InsufficientStockException("Insufficient stock remaining to fulfill this offer.");
        }

        // Create the agreed Order transactionally
        BigDecimal subtotal = agreedPrice.multiply(offer.getQuantity());
        BigDecimal platformFee = platformConfig.calculateFee(subtotal);
        BigDecimal totalAmount = subtotal.add(platformFee);

        String orderNumber = "KS-NEG-" + System.currentTimeMillis() % 10000000;

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setBuyer(offer.getBuyer());
        order.setFarmer(offer.getFarmer());
        order.setDeliveryType(DeliveryType.PICKUP);
        order.setDeliveryAddress(offer.getBuyer().getVillage());
        order.setStatus(OrderStatus.ACCEPTED); // Accepted immediately upon mutual agreement
        order.setSubtotal(subtotal);
        order.setPlatformFee(platformFee);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(PaymentMethod.PAY_ON_PICKUP);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setIdempotencyKey(UUID.randomUUID().toString());
        order.setNotes("Created from accepted negotiation offer #" + offer.getId() + " at ₹" + agreedPrice + "/" + listing.getUnit());

        order = orderRepository.save(order);

        OrderItem item = new OrderItem(order, listing, listing.getCropName(), offer.getQuantity(), listing.getUnit(), agreedPrice, subtotal);
        orderItemRepository.save(item);

        // Mark offer as CONSUMED
        offer.setStatus(OfferStatus.CONSUMED);
        offer = offerRepository.save(offer);

        auditService.log("OFFER_ACCEPTED", user.getPhone(), "Offer", offer.getId().toString(),
                "Offer accepted! Order #" + orderNumber + " created for ₹" + totalAmount);

        return OfferResponse.fromEntity(offer);
    }

    @Transactional
    public OfferResponse rejectOffer(User user, Long offerId) {
        Offer offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + offerId));

        boolean isFarmer = offer.getFarmer().getId().equals(user.getId());
        boolean isBuyer = offer.getBuyer().getId().equals(user.getId());

        if (!isFarmer && !isBuyer && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedOperationException("Not authorized to reject this offer.");
        }

        offer.setStatus(OfferStatus.REJECTED);
        offer = offerRepository.save(offer);

        auditService.log("OFFER_REJECTED", user.getPhone(), "Offer", offer.getId().toString(), "Offer rejected");
        return OfferResponse.fromEntity(offer);
    }

    public List<OfferResponse> getBuyerOffers(Long buyerId) {
        return offerRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
            .stream().map(OfferResponse::fromEntity).toList();
    }

    public List<OfferResponse> getFarmerOffers(Long farmerId) {
        return offerRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
            .stream().map(OfferResponse::fromEntity).toList();
    }
}

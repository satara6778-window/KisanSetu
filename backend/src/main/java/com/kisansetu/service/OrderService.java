package com.kisansetu.service;

import com.kisansetu.config.PlatformConfig;
import com.kisansetu.dto.OrderCreateRequest;
import com.kisansetu.dto.OrderResponse;
import com.kisansetu.entity.*;
import com.kisansetu.exception.*;
import com.kisansetu.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CropListingRepository cropListingRepository;
    private final ConversationRepository conversationRepository;
    private final PlatformConfig platformConfig;
    private final AuditService auditService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CropListingRepository cropListingRepository,
                        ConversationRepository conversationRepository,
                        PlatformConfig platformConfig,
                        AuditService auditService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cropListingRepository = cropListingRepository;
        this.conversationRepository = conversationRepository;
        this.platformConfig = platformConfig;
        this.auditService = auditService;
    }

    @Transactional
    public OrderResponse createOrder(User buyer, OrderCreateRequest request) {
        // 1. Check idempotency: If order with this idempotency key already exists, return it safely
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            var existing = orderRepository.findByIdempotencyKey(request.idempotencyKey());
            if (existing.isPresent()) {
                return OrderResponse.fromEntity(existing.get());
            }
        }

        // 2. Validate crop listing
        CropListing listing = cropListingRepository.findById(request.listingId())
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + request.listingId()));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new InsufficientStockException("This crop listing is currently not available for purchase (status: " + listing.getStatus() + ").");
        }

        if (buyer.getId().equals(listing.getFarmer().getId())) {
            throw new IllegalArgumentException("Farmers cannot purchase their own crop listings.");
        }

        // 3. ATOMIC STOCK REDUCTION - Prevents overselling race conditions
        int updatedRows = cropListingRepository.reduceStockAtomically(listing.getId(), request.quantity());
        if (updatedRows == 0) {
            throw new InsufficientStockException(
                "Insufficient stock available. Requested " + request.quantity() + " " + listing.getUnit() +
                ", but only " + listing.getAvailableQuantity() + " " + listing.getUnit() + " is left."
            );
        }

        // 4. Financial Calculations
        BigDecimal subtotal = listing.getPricePerUnit().multiply(request.quantity());
        BigDecimal platformFee = platformConfig.calculateFee(subtotal);
        BigDecimal totalAmount = subtotal.add(platformFee);

        // 5. Build and persist Order
        String orderNumber = "KS-" + System.currentTimeMillis() % 10000000 + "-" + (int)(Math.random() * 900 + 100);

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setBuyer(buyer);
        order.setFarmer(listing.getFarmer());
        order.setDeliveryType(request.deliveryType());
        order.setDeliveryAddress(request.deliveryAddress() != null ? request.deliveryAddress() : buyer.getVillage());
        order.setStatus(OrderStatus.PLACED);
        order.setSubtotal(subtotal);
        order.setPlatformFee(platformFee);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(request.paymentMethod() != null ? request.paymentMethod() :
                (request.deliveryType() == DeliveryType.PICKUP ? PaymentMethod.PAY_ON_PICKUP : PaymentMethod.CASH_ON_DELIVERY));
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setIdempotencyKey(request.idempotencyKey() != null ? request.idempotencyKey() : UUID.randomUUID().toString());
        order.setNotes(request.notes());

        order = orderRepository.save(order);

        // 6. Create OrderItem
        OrderItem item = new OrderItem(order, listing, listing.getCropName(), request.quantity(), listing.getUnit(), listing.getPricePerUnit(), subtotal);
        orderItemRepository.save(item);
        order.getItems().add(item);

        // 7. Auto-link or initialize conversation
        var existingConv = conversationRepository.findExistingConversation(buyer.getId(), listing.getFarmer().getId(), listing.getId());
        if (existingConv.isEmpty()) {
            Conversation conv = new Conversation();
            conv.setBuyer(buyer);
            conv.setFarmer(listing.getFarmer());
            conv.setListing(listing);
            conv.setOrder(order);
            conversationRepository.save(conv);
        }

        auditService.log("ORDER_PLACED", buyer.getPhone(), "Order", order.getId().toString(),
                "Order #" + orderNumber + " created for " + request.quantity() + " " + listing.getUnit() + " of " + listing.getCropName());

        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updateStatus(User user, Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        boolean isBuyer = order.getBuyer().getId().equals(user.getId());
        boolean isFarmer = order.getFarmer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isBuyer && !isFarmer && !isAdmin) {
            throw new UnauthorizedOperationException("You are not authorized to update this order.");
        }

        // Validate strict state transition sequence
        if (!isAdmin && !order.getStatus().canTransitionTo(newStatus, order.getDeliveryType())) {
            throw new IllegalOrderStateTransitionException(
                "Invalid status transition from " + order.getStatus() + " to " + newStatus + " for " + order.getDeliveryType() + " order."
            );
        }

        // Role-based action validation
        if (newStatus == OrderStatus.ACCEPTED || newStatus == OrderStatus.CONFIRMED ||
            newStatus == OrderStatus.PACKED || newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.READY_FOR_PICKUP) {
            if (!isFarmer && !isAdmin) {
                throw new UnauthorizedOperationException("Only the seller farmer can advance the order to " + newStatus);
            }
        }

        if (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.PICKED_UP || newStatus == OrderStatus.COMPLETED) {
            if (!isBuyer && !isAdmin) {
                throw new UnauthorizedOperationException("Only the buyer can confirm receipt and complete the order.");
            }
        }

        // If cancelling, restore stock atomically
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getListing() != null) {
                    cropListingRepository.restoreStockAtomically(item.getListing().getId(), item.getQuantity());
                }
            }
        }

        // If completed and cash/pickup payment, mark payment completed
        if (newStatus == OrderStatus.COMPLETED) {
            order.setPaymentStatus(PaymentStatus.COMPLETED);
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        auditService.log("ORDER_STATUS_UPDATE", user.getPhone(), "Order", order.getId().toString(),
                "Order status changed to " + newStatus);

        return OrderResponse.fromEntity(order);
    }

    public OrderResponse getOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        boolean isBuyer = order.getBuyer().getId().equals(user.getId());
        boolean isFarmer = order.getFarmer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isBuyer && !isFarmer && !isAdmin) {
            throw new UnauthorizedOperationException("You are not authorized to view this order.");
        }

        return OrderResponse.fromEntity(order);
    }

    public List<OrderResponse> getBuyerOrders(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
            .stream().map(OrderResponse::fromEntity).toList();
    }

    public List<OrderResponse> getFarmerOrders(Long farmerId) {
        return orderRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
            .stream().map(OrderResponse::fromEntity).toList();
    }
}

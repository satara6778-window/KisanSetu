package com.kisansetu.service;

import com.kisansetu.dto.ListingCreateRequest;
import com.kisansetu.dto.ListingResponse;
import com.kisansetu.entity.CropListing;
import com.kisansetu.entity.ListingStatus;
import com.kisansetu.entity.Role;
import com.kisansetu.entity.User;
import com.kisansetu.exception.ResourceNotFoundException;
import com.kisansetu.exception.UnauthorizedOperationException;
import com.kisansetu.repository.CropListingRepository;
import com.kisansetu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CropListingService {

    private final CropListingRepository cropListingRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public CropListingService(CropListingRepository cropListingRepository,
                              UserRepository userRepository,
                              AuditService auditService) {
        this.cropListingRepository = cropListingRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ListingResponse createListing(User farmer, ListingCreateRequest request) {
        if (farmer == null) {
            farmer = userRepository.findByPhone("9876543210")
                    .orElseThrow(() -> new UnauthorizedOperationException("Authentication required: Farmer account not found."));
        } else if (farmer.getRole() != Role.FARMER && farmer.getRole() != Role.ADMIN) {
            throw new UnauthorizedOperationException("Only farmers can create crop listings.");
        }

        CropListing listing = new CropListing();
        listing.setFarmer(farmer);
        listing.setCropName(request.cropName());
        listing.setMarathiAlias(request.marathiAlias());
        listing.setHindiAlias(request.hindiAlias());
        listing.setCategory(request.category());
        listing.setDescription(request.description());
        listing.setImageUrl(request.imageUrl());
        listing.setAvailableQuantity(request.availableQuantity());
        listing.setUnit(request.unit());
        listing.setPricePerUnit(request.pricePerUnit());
        listing.setQualityGrade(request.qualityGrade() != null ? request.qualityGrade() : "Grade A");
        listing.setVillage(request.village() != null ? request.village() : farmer.getVillage());
        listing.setDistrict(request.district() != null ? request.district() : farmer.getDistrict());
        listing.setState(request.state() != null ? request.state() : farmer.getState());
        listing.setPickupAvailable(request.pickupAvailable() != null ? request.pickupAvailable() : true);
        listing.setDeliveryAvailable(request.deliveryAvailable() != null ? request.deliveryAvailable() : false);
        listing.setStatus(ListingStatus.ACTIVE);

        listing = cropListingRepository.save(listing);
        auditService.log("LISTING_CREATE", farmer.getPhone(), "CropListing", listing.getId().toString(), "Created crop: " + listing.getCropName());

        return ListingResponse.fromEntity(listing);
    }

    @Transactional
    public ListingResponse updateListing(User farmer, Long id, ListingCreateRequest request) {
        CropListing listing = cropListingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crop listing not found with ID: " + id));

        if (!listing.getFarmer().getId().equals(farmer.getId()) && farmer.getRole() != Role.ADMIN) {
            throw new UnauthorizedOperationException("You do not have permission to modify this listing.");
        }

        listing.setCropName(request.cropName());
        listing.setMarathiAlias(request.marathiAlias());
        listing.setHindiAlias(request.hindiAlias());
        listing.setCategory(request.category());
        listing.setDescription(request.description());
        if (request.imageUrl() != null) listing.setImageUrl(request.imageUrl());
        listing.setAvailableQuantity(request.availableQuantity());
        listing.setUnit(request.unit());
        listing.setPricePerUnit(request.pricePerUnit());
        if (request.qualityGrade() != null) listing.setQualityGrade(request.qualityGrade());
        if (request.village() != null) listing.setVillage(request.village());
        if (request.pickupAvailable() != null) listing.setPickupAvailable(request.pickupAvailable());
        if (request.deliveryAvailable() != null) listing.setDeliveryAvailable(request.deliveryAvailable());

        listing = cropListingRepository.save(listing);
        auditService.log("LISTING_UPDATE", farmer.getPhone(), "CropListing", listing.getId().toString(), "Updated listing details");

        return ListingResponse.fromEntity(listing);
    }

    @Transactional
    public ListingResponse updateStatus(User farmer, Long id, ListingStatus status) {
        CropListing listing = cropListingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crop listing not found with ID: " + id));

        if (!listing.getFarmer().getId().equals(farmer.getId()) && farmer.getRole() != Role.ADMIN) {
            throw new UnauthorizedOperationException("You do not have permission to modify this listing status.");
        }

        listing.setStatus(status);
        listing = cropListingRepository.save(listing);
        auditService.log("LISTING_STATUS_CHANGE", farmer.getPhone(), "CropListing", listing.getId().toString(), "Status changed to " + status);

        return ListingResponse.fromEntity(listing);
    }

    public List<ListingResponse> getActiveListings() {
        return cropListingRepository.findByStatusOrderByCreatedAtDesc(ListingStatus.ACTIVE)
            .stream().map(ListingResponse::fromEntity).toList();
    }

    public List<ListingResponse> searchListings(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getActiveListings();
        }
        return cropListingRepository.searchActiveListings(query.trim())
            .stream().map(ListingResponse::fromEntity).toList();
    }

    public List<ListingResponse> filterListings(String category, BigDecimal minPrice, BigDecimal maxPrice, String grade) {
        return cropListingRepository.filterListings(category, minPrice, maxPrice, grade)
            .stream().map(ListingResponse::fromEntity).toList();
    }

    public ListingResponse getListingById(Long id) {
        CropListing listing = cropListingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crop listing not found with ID: " + id));
        return ListingResponse.fromEntity(listing);
    }

    public List<ListingResponse> getFarmerListings(Long farmerId) {
        return cropListingRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId)
            .stream().map(ListingResponse::fromEntity).toList();
    }
}

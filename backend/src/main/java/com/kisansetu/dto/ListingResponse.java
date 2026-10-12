package com.kisansetu.dto;

import com.kisansetu.entity.CropListing;
import com.kisansetu.entity.ListingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ListingResponse(
    Long id,
    UserDto farmer,
    String cropName,
    String marathiAlias,
    String hindiAlias,
    String category,
    String description,
    String imageUrl,
    BigDecimal availableQuantity,
    String unit,
    BigDecimal pricePerUnit,
    String qualityGrade,
    String village,
    String district,
    String state,
    boolean pickupAvailable,
    boolean deliveryAvailable,
    ListingStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ListingResponse fromEntity(CropListing listing) {
        if (listing == null) return null;
        return new ListingResponse(
            listing.getId(),
            UserDto.fromEntity(listing.getFarmer()),
            listing.getCropName(),
            listing.getMarathiAlias(),
            listing.getHindiAlias(),
            listing.getCategory(),
            listing.getDescription(),
            listing.getImageUrl(),
            listing.getAvailableQuantity(),
            listing.getUnit(),
            listing.getPricePerUnit(),
            listing.getQualityGrade(),
            listing.getVillage(),
            listing.getDistrict(),
            listing.getState(),
            listing.isPickupAvailable(),
            listing.isDeliveryAvailable(),
            listing.getStatus(),
            listing.getCreatedAt(),
            listing.getUpdatedAt()
        );
    }
}

package com.kisansetu.dto;

import com.kisansetu.entity.Offer;
import com.kisansetu.entity.OfferStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OfferResponse(
    Long id,
    Long listingId,
    String cropName,
    String unit,
    BigDecimal listingPrice,
    UserDto buyer,
    UserDto farmer,
    BigDecimal offeredPrice,
    BigDecimal quantity,
    BigDecimal counterPrice,
    OfferStatus status,
    String buyerNotes,
    String farmerNotes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static OfferResponse fromEntity(Offer offer) {
        if (offer == null) return null;
        return new OfferResponse(
            offer.getId(),
            offer.getListing() != null ? offer.getListing().getId() : null,
            offer.getListing() != null ? offer.getListing().getCropName() : null,
            offer.getListing() != null ? offer.getListing().getUnit() : null,
            offer.getListing() != null ? offer.getListing().getPricePerUnit() : null,
            UserDto.fromEntity(offer.getBuyer()),
            UserDto.fromEntity(offer.getFarmer()),
            offer.getOfferedPrice(),
            offer.getQuantity(),
            offer.getCounterPrice(),
            offer.getStatus(),
            offer.getBuyerNotes(),
            offer.getFarmerNotes(),
            offer.getCreatedAt(),
            offer.getUpdatedAt()
        );
    }
}

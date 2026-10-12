package com.kisansetu.dto;

import com.kisansetu.entity.MarketPriceRecord;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MarketPriceResponse(
    Long id,
    String cropName,
    String marathiName,
    String marketName,
    String district,
    String state,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    BigDecimal modalPrice,
    String unit,
    LocalDate observationDate,
    String sourceName,
    String sourceRecordId,
    LocalDateTime importTimestamp
) {
    public static MarketPriceResponse fromEntity(MarketPriceRecord record) {
        if (record == null) return null;
        return new MarketPriceResponse(
            record.getId(),
            record.getCropName(),
            record.getMarathiName(),
            record.getMarketName(),
            record.getDistrict(),
            record.getState(),
            record.getMinPrice(),
            record.getMaxPrice(),
            record.getModalPrice(),
            record.getUnit(),
            record.getObservationDate(),
            record.getSourceName(),
            record.getSourceRecordId(),
            record.getImportTimestamp()
        );
    }
}

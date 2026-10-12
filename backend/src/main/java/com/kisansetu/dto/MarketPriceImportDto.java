package com.kisansetu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MarketPriceImportDto(
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
    String sourceName
) {}

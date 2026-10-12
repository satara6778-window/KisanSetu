package com.kisansetu.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PriceExplanationResponse(
    String cropName,
    BigDecimal storedModalPrice,
    BigDecimal storedMinPrice,
    BigDecimal storedMaxPrice,
    String unit,
    String marketName,
    LocalDate observationDate,
    String sourceName,
    String aiAnalysis, // Clear historical insight explaining the stored factual records
    String disclaimer // "Historical trend analysis based on verified mandi records. Not a guaranteed forecast. Selling price decision remains with the farmer."
) {}

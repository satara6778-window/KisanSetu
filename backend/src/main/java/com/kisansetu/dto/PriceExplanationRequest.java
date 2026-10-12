package com.kisansetu.dto;

import java.math.BigDecimal;
import java.util.List;

public record PriceExplanationRequest(
    String cropName,
    String marketName,
    BigDecimal currentFarmerPrice,
    BigDecimal transportCostPerUnit
) {}

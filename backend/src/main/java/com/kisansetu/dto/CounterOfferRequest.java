package com.kisansetu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CounterOfferRequest(
    @NotNull(message = "Counter price per unit is required")
    @DecimalMin(value = "0.01", message = "Counter price must be greater than 0")
    BigDecimal counterPrice,

    String notes
) {}

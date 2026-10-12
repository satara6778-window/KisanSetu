package com.kisansetu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OfferCreateRequest(
    @NotNull(message = "Listing ID is required")
    Long listingId,

    @NotNull(message = "Offered price per unit is required")
    @DecimalMin(value = "0.01", message = "Offered price must be greater than 0")
    BigDecimal offeredPrice,

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    BigDecimal quantity,

    String notes
) {}

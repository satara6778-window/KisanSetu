package com.kisansetu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ListingCreateRequest(
    @NotBlank(message = "Crop name is required")
    String cropName,

    String marathiAlias,
    String hindiAlias,

    @NotBlank(message = "Category is required")
    String category,

    String description,
    String imageUrl,

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    BigDecimal availableQuantity,

    @NotBlank(message = "Unit is required")
    String unit,

    @NotNull(message = "Price per unit is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    BigDecimal pricePerUnit,

    String qualityGrade,
    String village,
    String district,
    String state,
    Boolean pickupAvailable,
    Boolean deliveryAvailable
) {}

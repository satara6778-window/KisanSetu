package com.kisansetu.dto;

import com.kisansetu.entity.DeliveryType;
import com.kisansetu.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OrderCreateRequest(
    @NotNull(message = "Listing ID is required")
    Long listingId,

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    BigDecimal quantity,

    @NotNull(message = "Delivery type is required (PICKUP or DELIVERY)")
    DeliveryType deliveryType,

    String deliveryAddress,

    PaymentMethod paymentMethod,

    String notes,

    // Idempotency key prevents duplicate orders on retries or double-clicks
    String idempotencyKey
) {}

package com.kisansetu.dto;

import com.kisansetu.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
    @NotNull(message = "New status is required")
    OrderStatus status
) {}

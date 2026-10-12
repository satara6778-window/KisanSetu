package com.kisansetu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ComplaintCreateRequest(
    @NotNull(message = "Target user ID is required")
    Long targetUserId,

    Long orderId,

    @NotBlank(message = "Reason for complaint is required")
    String reason
) {}

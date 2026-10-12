package com.kisansetu.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Phone number is required")
    String phone,

    @NotBlank(message = "Password or OTP is required")
    String password
) {}

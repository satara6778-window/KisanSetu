package com.kisansetu.dto;

import com.kisansetu.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be a valid 10-digit number")
    String phone,

    @NotBlank(message = "Password is required")
    String password,

    @NotBlank(message = "Full name is required")
    String fullName,

    @NotNull(message = "Role is required (FARMER, CONSUMER, WHOLESALER, ADMIN)")
    Role role,

    String village,
    String district,
    String state,
    String preferredLanguage
) {}

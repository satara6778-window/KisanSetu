package com.kisansetu.dto;

import com.kisansetu.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public record ComplaintResolveRequest(
    @NotNull(message = "Status is required (RESOLVED or DISMISSED)")
    ComplaintStatus status,

    String resolutionNotes
) {}

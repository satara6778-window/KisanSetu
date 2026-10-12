package com.kisansetu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendMessageRequest(
    @NotNull(message = "Conversation ID is required")
    Long conversationId,

    @NotBlank(message = "Content is required")
    String content,

    String targetLanguage
) {}

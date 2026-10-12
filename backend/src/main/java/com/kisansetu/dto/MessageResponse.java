package com.kisansetu.dto;

import com.kisansetu.entity.Message;
import java.time.LocalDateTime;

public record MessageResponse(
    Long id,
    Long conversationId,
    UserDto sender,
    String content,
    String originalLanguage,
    String translatedContent,
    boolean machineTranslated,
    LocalDateTime createdAt
) {
    public static MessageResponse fromEntity(Message message) {
        if (message == null) return null;
        return new MessageResponse(
            message.getId(),
            message.getConversation() != null ? message.getConversation().getId() : null,
            UserDto.fromEntity(message.getSender()),
            message.getContent(),
            message.getOriginalLanguage(),
            message.getTranslatedContent(),
            message.isMachineTranslated(),
            message.getCreatedAt()
        );
    }
}

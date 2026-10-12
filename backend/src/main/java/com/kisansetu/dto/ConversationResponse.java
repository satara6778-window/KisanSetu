package com.kisansetu.dto;

import com.kisansetu.entity.Conversation;
import java.time.LocalDateTime;

public record ConversationResponse(
    Long id,
    UserDto buyer,
    UserDto farmer,
    Long listingId,
    String cropName,
    Long orderId,
    String orderNumber,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ConversationResponse fromEntity(Conversation conv) {
        if (conv == null) return null;
        return new ConversationResponse(
            conv.getId(),
            UserDto.fromEntity(conv.getBuyer()),
            UserDto.fromEntity(conv.getFarmer()),
            conv.getListing() != null ? conv.getListing().getId() : null,
            conv.getListing() != null ? conv.getListing().getCropName() : null,
            conv.getOrder() != null ? conv.getOrder().getId() : null,
            conv.getOrder() != null ? conv.getOrder().getOrderNumber() : null,
            conv.getCreatedAt(),
            conv.getUpdatedAt()
        );
    }
}

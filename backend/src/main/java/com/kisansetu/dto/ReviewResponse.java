package com.kisansetu.dto;

import com.kisansetu.entity.Review;
import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    Long orderId,
    UserDto reviewer,
    UserDto farmer,
    Integer rating,
    String comment,
    LocalDateTime createdAt
) {
    public static ReviewResponse fromEntity(Review review) {
        if (review == null) return null;
        return new ReviewResponse(
            review.getId(),
            review.getOrder() != null ? review.getOrder().getId() : null,
            UserDto.fromEntity(review.getReviewer()),
            UserDto.fromEntity(review.getFarmer()),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }
}

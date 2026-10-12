package com.kisansetu.dto;

import com.kisansetu.entity.Complaint;
import com.kisansetu.entity.ComplaintStatus;
import java.time.LocalDateTime;

public record ComplaintResponse(
    Long id,
    UserDto complainant,
    UserDto targetUser,
    Long orderId,
    String reason,
    ComplaintStatus status,
    String resolutionNotes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ComplaintResponse fromEntity(Complaint complaint) {
        if (complaint == null) return null;
        return new ComplaintResponse(
            complaint.getId(),
            UserDto.fromEntity(complaint.getComplainant()),
            UserDto.fromEntity(complaint.getTargetUser()),
            complaint.getOrder() != null ? complaint.getOrder().getId() : null,
            complaint.getReason(),
            complaint.getStatus(),
            complaint.getResolutionNotes(),
            complaint.getCreatedAt(),
            complaint.getUpdatedAt()
        );
    }
}

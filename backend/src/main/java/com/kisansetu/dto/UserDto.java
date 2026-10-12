package com.kisansetu.dto;

import com.kisansetu.entity.Role;
import com.kisansetu.entity.User;

public record UserDto(
    Long id,
    String phone,
    String fullName,
    Role role,
    String village,
    String district,
    String state,
    String preferredLanguage,
    boolean blocked
) {
    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
            user.getId(),
            user.getPhone(),
            user.getFullName(),
            user.getRole(),
            user.getVillage(),
            user.getDistrict(),
            user.getState(),
            user.getPreferredLanguage(),
            user.isBlocked()
        );
    }
}

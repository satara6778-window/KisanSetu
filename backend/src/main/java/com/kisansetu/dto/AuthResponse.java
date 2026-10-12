package com.kisansetu.dto;

public record AuthResponse(
    String token,
    UserDto user
) {}

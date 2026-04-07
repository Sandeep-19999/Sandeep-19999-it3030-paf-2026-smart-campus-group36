package com.smartcampus.dto.auth;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        String role
) {
}

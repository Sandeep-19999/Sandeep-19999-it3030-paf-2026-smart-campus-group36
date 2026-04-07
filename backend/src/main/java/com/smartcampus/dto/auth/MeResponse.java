package com.smartcampus.dto.auth;

public record MeResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String avatarUrl,
        String authProvider
) {
}

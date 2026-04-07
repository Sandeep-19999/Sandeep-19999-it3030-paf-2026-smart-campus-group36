package com.smartcampus.dto.ticket;

public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        String role
) {
}

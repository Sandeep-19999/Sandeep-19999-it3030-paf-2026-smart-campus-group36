package com.smartcampus.dto.booking;

public record FacilityResponse(
        Long id,
        String name,
        String type,
        String location,
        Integer capacity,
        String description,
        boolean active,
        String createdAt,
        String updatedAt
) {
}

package com.smartcampus.dto.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FacilityRequest(
        @NotBlank String name,
        @NotBlank String type,
        @NotBlank String location,
        @NotNull @Min(1) Integer capacity,
        @NotBlank String description,
        @NotNull Boolean active
) {
}

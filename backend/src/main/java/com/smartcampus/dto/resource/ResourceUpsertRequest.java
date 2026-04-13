package com.smartcampus.dto.resource;

import com.smartcampus.enums.Status;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalTime;

public record ResourceUpsertRequest(
        @NotBlank String name,
        @NotBlank String type,
        @NotNull @Positive Integer capacity,
        @NotBlank String location,
        @NotNull Status status,
        @NotNull LocalTime availabilityStart,
        @NotNull LocalTime availabilityEnd
) {
    @AssertTrue(message = "availabilityStart must be before availabilityEnd")
    public boolean isAvailabilityWindowValid() {
        if (availabilityStart == null || availabilityEnd == null) {
            return true;
        }
        return availabilityStart.isBefore(availabilityEnd);
    }
}

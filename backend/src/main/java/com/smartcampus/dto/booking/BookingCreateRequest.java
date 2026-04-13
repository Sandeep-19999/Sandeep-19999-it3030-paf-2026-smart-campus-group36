package com.smartcampus.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record BookingCreateRequest(
        @NotNull Long facilityId,
        @NotBlank String purpose,
        @NotNull @Future LocalDateTime startTime,
        @NotNull @Future LocalDateTime endTime
) {
}

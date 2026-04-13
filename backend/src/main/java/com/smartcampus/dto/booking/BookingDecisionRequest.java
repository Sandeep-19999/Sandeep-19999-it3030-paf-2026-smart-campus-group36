package com.smartcampus.dto.booking;

import com.smartcampus.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record BookingDecisionRequest(
        @NotNull BookingStatus status,
        String reason
) {
}

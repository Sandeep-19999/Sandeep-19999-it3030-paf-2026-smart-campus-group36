package com.smartcampus.dto.booking;

import jakarta.validation.constraints.NotBlank;

public record BookingCheckInRequest(
        @NotBlank String qrCodeToken
) {
}

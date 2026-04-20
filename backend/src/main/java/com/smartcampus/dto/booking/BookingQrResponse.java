package com.smartcampus.dto.booking;

public record BookingQrResponse(
        Long bookingId,
        String qrCodeToken,
        String qrCodeImageBase64
) {
}

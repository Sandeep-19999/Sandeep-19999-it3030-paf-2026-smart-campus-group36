package com.smartcampus.dto.booking;

import com.smartcampus.dto.ticket.UserSummaryResponse;

public record BookingResponse(
        Long id,
        FacilityResponse facility,
        UserSummaryResponse requester,
        String purpose,
        String startTime,
        String endTime,
        String status,
        String decisionReason,
        String createdAt,
        String updatedAt
) {
}

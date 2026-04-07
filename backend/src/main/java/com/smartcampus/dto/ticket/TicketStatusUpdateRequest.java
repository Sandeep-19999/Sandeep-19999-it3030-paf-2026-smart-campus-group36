package com.smartcampus.dto.ticket;

import com.smartcampus.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TicketStatusUpdateRequest(
        @NotNull TicketStatus status,
        String resolutionNotes,
        String rejectionReason
) {
}

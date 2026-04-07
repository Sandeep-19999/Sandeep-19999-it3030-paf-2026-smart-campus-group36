package com.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotNull;

public record TicketAssignmentRequest(
        @NotNull Long technicianId
) {
}

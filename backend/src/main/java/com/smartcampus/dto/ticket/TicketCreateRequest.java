package com.smartcampus.dto.ticket;

import com.smartcampus.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketCreateRequest(
        @NotBlank String title,
        @NotBlank String category,
        @NotBlank String description,
        @NotNull TicketPriority priority,
        @NotBlank String locationLabel,
        String resourceName,
        String relatedResourceId,
        @NotBlank String preferredContact
) {
}

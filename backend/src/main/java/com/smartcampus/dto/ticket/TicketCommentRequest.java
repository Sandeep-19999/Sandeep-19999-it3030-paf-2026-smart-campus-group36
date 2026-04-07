package com.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotBlank;

public record TicketCommentRequest(
        @NotBlank String content
) {
}

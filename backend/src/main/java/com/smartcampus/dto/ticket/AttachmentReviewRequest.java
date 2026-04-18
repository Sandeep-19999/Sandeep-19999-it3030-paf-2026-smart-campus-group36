package com.smartcampus.dto.ticket;

import com.smartcampus.enums.AttachmentReviewStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AttachmentReviewRequest(
        @NotNull AttachmentReviewStatus status,
        @NotBlank String adminMessage
) {
}

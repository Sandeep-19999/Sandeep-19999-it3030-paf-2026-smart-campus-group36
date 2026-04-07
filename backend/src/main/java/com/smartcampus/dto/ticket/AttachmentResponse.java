package com.smartcampus.dto.ticket;

public record AttachmentResponse(
        Long id,
        String originalFileName,
        String contentType,
        String uploadedAt,
        UserSummaryResponse uploadedBy
) {
}

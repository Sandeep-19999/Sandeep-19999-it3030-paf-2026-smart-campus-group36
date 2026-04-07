package com.smartcampus.dto.ticket;

public record CommentResponse(
        Long id,
        String content,
        String createdAt,
        String updatedAt,
        UserSummaryResponse author,
        boolean editable
) {
}

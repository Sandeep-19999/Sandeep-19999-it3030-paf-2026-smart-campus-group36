package com.smartcampus.dto.ticket;

import java.util.List;

public record TicketResponse(
        Long id,
        String title,
        String category,
        String description,
        String priority,
        String status,
        String locationLabel,
        String resourceName,
        String relatedResourceId,
        String preferredContact,
        String rejectionReason,
        String resolutionNotes,
        String createdAt,
        String updatedAt,
        UserSummaryResponse creator,
        UserSummaryResponse assignedTechnician,
        List<AttachmentResponse> attachments,
        List<CommentResponse> comments
) {
}

package com.smartcampus.dto.notification;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        String type,
        boolean read,
        String referenceId,
        String createdAt
) {
}

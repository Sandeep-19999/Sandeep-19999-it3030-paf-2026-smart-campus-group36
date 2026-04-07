package com.smartcampus.service;

import com.smartcampus.dto.notification.NotificationResponse;
import com.smartcampus.entity.Notification;
import com.smartcampus.entity.User;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification create(User recipient, String title, String message, NotificationType type, String referenceId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        return notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMine(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::map)
                .toList();
    }

    public long unreadCount(User user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    public NotificationResponse markAsRead(User user, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You cannot update this notification");
        }
        notification.setRead(true);
        return map(notificationRepository.save(notification));
    }

    public void markAllRead(User user) {
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public NotificationResponse map(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType().name(),
                notification.isRead(),
                notification.getReferenceId(),
                notification.getCreatedAt().toString()
        );
    }
}

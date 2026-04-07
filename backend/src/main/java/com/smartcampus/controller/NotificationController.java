package com.smartcampus.controller;

import com.smartcampus.dto.notification.NotificationResponse;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public List<NotificationResponse> getMine(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return notificationService.getMine(currentUser);
    }

    @GetMapping("/summary")
    public Map<String, Long> summary(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return Map.of("unreadCount", notificationService.unreadCount(currentUser));
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id, Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return notificationService.markAsRead(currentUser, id);
    }

    @PatchMapping("/read-all")
    public Map<String, String> markAllRead(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        notificationService.markAllRead(currentUser);
        return Map.of("message", "All notifications marked as read");
    }
}

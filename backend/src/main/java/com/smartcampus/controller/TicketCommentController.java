package com.smartcampus.controller;

import com.smartcampus.dto.ticket.CommentResponse;
import com.smartcampus.dto.ticket.TicketCommentRequest;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class TicketCommentController {

    private final TicketService ticketService;
    private final AuthService authService;

    public TicketCommentController(TicketService ticketService, AuthService authService) {
        this.ticketService = ticketService;
        this.authService = authService;
    }

    @PutMapping("/{commentId}")
    public CommentResponse update(@PathVariable Long commentId,
                                  @Valid @RequestBody TicketCommentRequest request,
                                  Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.updateComment(commentId, request.content(), currentUser);
    }

    @DeleteMapping("/{commentId}")
    public Map<String, String> delete(@PathVariable Long commentId, Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        ticketService.deleteComment(commentId, currentUser);
        return Map.of("message", "Comment deleted successfully");
    }
}

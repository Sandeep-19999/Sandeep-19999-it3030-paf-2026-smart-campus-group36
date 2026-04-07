package com.smartcampus.controller;

import com.smartcampus.dto.ticket.TicketAssignmentRequest;
import com.smartcampus.dto.ticket.TicketCommentRequest;
import com.smartcampus.dto.ticket.TicketCreateRequest;
import com.smartcampus.dto.ticket.TicketResponse;
import com.smartcampus.dto.ticket.TicketStatusUpdateRequest;
import com.smartcampus.entity.TicketAttachment;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.FileStorageService;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final AuthService authService;
    private final FileStorageService fileStorageService;

    public TicketController(
            TicketService ticketService,
            AuthService authService,
            FileStorageService fileStorageService
    ) {
        this.ticketService = ticketService;
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    public TicketResponse create(
            @Valid @RequestBody TicketCreateRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.createTicket(request, currentUser);
    }

    @GetMapping
    public List<TicketResponse> getTickets(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.getTickets(currentUser);
    }

    @GetMapping("/mine")
    public List<TicketResponse> getMyTickets(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.getMyTickets(currentUser);
    }

    @GetMapping("/{id}")
    public TicketResponse getById(@PathVariable Long id, Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.getById(id, currentUser);
    }

    @PatchMapping("/{id}/assign-technician")
    public TicketResponse assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody TicketAssignmentRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.assignTechnician(id, request.technicianId(), currentUser);
    }

    @PatchMapping("/{id}/status")
    public TicketResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.updateStatus(id, request, currentUser);
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TicketResponse addAttachments(
            @PathVariable Long id,
            @RequestPart("files") List<MultipartFile> files,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.addAttachments(id, files, currentUser);
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Long attachmentId,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        TicketAttachment attachment = ticketService.getAttachmentForDownload(attachmentId, currentUser);
        Resource resource = fileStorageService.loadAsResource(attachment.getFilePath());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getOriginalFileName() + "\""
                )
                .body(resource);
    }

    @PostMapping("/{id}/comments")
    public TicketResponse addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return ticketService.addComment(id, request.content(), currentUser);
    }
}
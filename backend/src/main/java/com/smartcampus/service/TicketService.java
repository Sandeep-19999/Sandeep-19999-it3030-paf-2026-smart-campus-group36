package com.smartcampus.service;

import com.smartcampus.dto.ticket.*;
import com.smartcampus.entity.*;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.enums.Role;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository ticketCommentRepository,
                         TicketAttachmentRepository ticketAttachmentRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         FileStorageService fileStorageService) {
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketAttachmentRepository = ticketAttachmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    public TicketResponse createTicket(TicketCreateRequest request, User creator) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setCategory(request.category());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setLocationLabel(request.locationLabel());
        ticket.setResourceName(request.resourceName());
        ticket.setRelatedResourceId(request.relatedResourceId());
        ticket.setPreferredContact(request.preferredContact());
        ticket.setCreator(creator);
        Ticket saved = ticketRepository.save(ticket);

        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                notificationService.create(admin,
                        "New incident ticket",
                        creator.getFullName() + " created ticket #" + saved.getId(),
                        NotificationType.TICKET_CREATED,
                        String.valueOf(saved.getId()))
        );
        return map(saved, creator);
    }

    public List<TicketResponse> getMyTickets(User currentUser) {
        return ticketRepository.findByCreatorOrderByCreatedAtDesc(currentUser).stream()
                .map(ticket -> map(ticket, currentUser))
                .toList();
    }

    public List<TicketResponse> getTickets(User currentUser) {
        if (currentUser.getRole() == Role.USER) {
            return getMyTickets(currentUser);
        }
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ticket -> map(ticket, currentUser))
                .toList();
    }

    public TicketResponse getById(Long id, User currentUser) {
        Ticket ticket = requireTicketAccess(id, currentUser);
        return map(ticket, currentUser);
    }

    public TicketResponse assignTechnician(Long id, Long technicianId, User currentUser) {
        requireAdmin(currentUser);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new BadRequestException("Selected user is not a technician");
        }
        ticket.setAssignedTechnician(technician);
        Ticket saved = ticketRepository.save(ticket);
        notificationService.create(technician,
                "Ticket assigned",
                "You were assigned to ticket #" + ticket.getId(),
                NotificationType.ASSIGNMENT,
                String.valueOf(ticket.getId()));
        return map(saved, currentUser);
    }

    public TicketResponse updateStatus(Long id, TicketStatusUpdateRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        requireManagementAccess(ticket, currentUser);

        if (request.status() == TicketStatus.REJECTED && (request.rejectionReason() == null || request.rejectionReason().isBlank())) {
            throw new BadRequestException("Rejection reason is required when rejecting a ticket");
        }
        if ((request.status() == TicketStatus.RESOLVED || request.status() == TicketStatus.CLOSED) && (request.resolutionNotes() == null || request.resolutionNotes().isBlank())) {
            throw new BadRequestException("Resolution notes are required when resolving or closing a ticket");
        }
        ticket.setStatus(request.status());
        if (request.rejectionReason() != null) {
            ticket.setRejectionReason(request.rejectionReason());
        }
        if (request.resolutionNotes() != null) {
            ticket.setResolutionNotes(request.resolutionNotes());
        }
        Ticket saved = ticketRepository.save(ticket);
        notificationService.create(ticket.getCreator(),
                "Ticket status updated",
                "Ticket #" + ticket.getId() + " changed to " + request.status().name(),
                NotificationType.TICKET_UPDATED,
                String.valueOf(ticket.getId()));
        return map(saved, currentUser);
    }

    public TicketResponse addAttachments(Long ticketId, List<MultipartFile> files, User currentUser) {
        Ticket ticket = requireTicketAccess(ticketId, currentUser);
        if (!(ticket.getCreator().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ADMIN)) {
            throw new ForbiddenOperationException("Only the ticket creator or admin can upload attachments");
        }
        if (ticket.getAttachments().size() + files.size() > 3) {
            throw new BadRequestException("A ticket can only have up to 3 attachments");
        }
        List<TicketAttachment> attachments = fileStorageService.storeTicketFiles(ticket, currentUser, files);
        attachments.forEach(attachment -> attachment.setTicket(ticket));
        ticket.getAttachments().addAll(attachments);
        ticketAttachmentRepository.saveAll(attachments);
        Ticket saved = ticketRepository.save(ticket);
        return map(saved, currentUser);
    }

    public TicketResponse addComment(Long ticketId, String content, User currentUser) {
        Ticket ticket = requireTicketAccess(ticketId, currentUser);
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(currentUser);
        comment.setContent(content);
        ticketCommentRepository.save(comment);
        ticket.getComments().add(comment);
        ticketRepository.save(ticket);

        if (!ticket.getCreator().getId().equals(currentUser.getId())) {
            notificationService.create(ticket.getCreator(),
                    "New comment on your ticket",
                    currentUser.getFullName() + " commented on ticket #" + ticket.getId(),
                    NotificationType.COMMENT_ADDED,
                    String.valueOf(ticket.getId()));
        }
        if (ticket.getAssignedTechnician() != null && !ticket.getAssignedTechnician().getId().equals(currentUser.getId())) {
            notificationService.create(ticket.getAssignedTechnician(),
                    "New comment on assigned ticket",
                    currentUser.getFullName() + " commented on ticket #" + ticket.getId(),
                    NotificationType.COMMENT_ADDED,
                    String.valueOf(ticket.getId()));
        }
        return map(ticketRepository.findById(ticketId).orElseThrow(), currentUser);
    }

    public CommentResponse updateComment(Long commentId, String content, User currentUser) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!(comment.getAuthor().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ADMIN)) {
            throw new ForbiddenOperationException("Only the owner or admin can edit this comment");
        }
        comment.setContent(content);
        return map(comment, currentUser);
    }

    public void deleteComment(Long commentId, User currentUser) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!(comment.getAuthor().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ADMIN)) {
            throw new ForbiddenOperationException("Only the owner or admin can delete this comment");
        }
        ticketCommentRepository.delete(comment);
    }

    public TicketAttachment getAttachmentForDownload(Long attachmentId, User currentUser) {
        TicketAttachment attachment = ticketAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        requireTicketAccess(attachment.getTicket().getId(), currentUser);
        return attachment;
    }

    private Ticket requireTicketAccess(Long ticketId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.TECHNICIAN) {
            return ticket;
        }
        if (!ticket.getCreator().getId().equals(currentUser.getId())) {
            throw new ForbiddenOperationException("You do not have access to this ticket");
        }
        return ticket;
    }

    private void requireManagementAccess(Ticket ticket, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }
        if (currentUser.getRole() == Role.TECHNICIAN && ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getId().equals(currentUser.getId())) {
            return;
        }
        throw new ForbiddenOperationException("Only an admin or the assigned technician can update ticket status");
    }

    private void requireAdmin(User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenOperationException("Only admins can perform this action");
        }
    }

    private TicketResponse map(Ticket ticket, User currentUser) {
        List<AttachmentResponse> attachmentResponses = ticket.getAttachments().stream()
                .sorted(Comparator.comparing(TicketAttachment::getUploadedAt))
                .map(this::map)
                .toList();
        List<CommentResponse> commentResponses = ticket.getComments().stream()
                .sorted(Comparator.comparing(TicketComment::getCreatedAt))
                .map(comment -> map(comment, currentUser))
                .toList();
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getCategory(),
                ticket.getDescription(),
                ticket.getPriority().name(),
                ticket.getStatus().name(),
                ticket.getLocationLabel(),
                ticket.getResourceName(),
                ticket.getRelatedResourceId(),
                ticket.getPreferredContact(),
                ticket.getRejectionReason(),
                ticket.getResolutionNotes(),
                ticket.getCreatedAt().toString(),
                ticket.getUpdatedAt().toString(),
                map(ticket.getCreator()),
                ticket.getAssignedTechnician() == null ? null : map(ticket.getAssignedTechnician()),
                attachmentResponses,
                commentResponses
        );
    }

    private AttachmentResponse map(TicketAttachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getOriginalFileName(),
                attachment.getContentType(),
                attachment.getUploadedAt().toString(),
                map(attachment.getUploadedBy())
        );
    }

    private CommentResponse map(TicketComment comment, User currentUser) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt().toString(),
                comment.getUpdatedAt().toString(),
                map(comment.getAuthor()),
                comment.getAuthor().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ADMIN
        );
    }

    private UserSummaryResponse map(User user) {
        return new UserSummaryResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }
}

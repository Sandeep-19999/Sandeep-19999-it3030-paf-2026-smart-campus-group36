package com.smartcampus.service;

import com.smartcampus.dto.booking.BookingCreateRequest;
import com.smartcampus.dto.booking.BookingDecisionRequest;
import com.smartcampus.dto.booking.BookingQrResponse;
import com.smartcampus.dto.booking.BookingResponse;
import com.smartcampus.dto.ticket.UserSummaryResponse;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Facility;
import com.smartcampus.entity.User;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.enums.Role;
import com.smartcampus.enums.Status;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.FacilityRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.model.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final FacilityService facilityService;
    private final FacilityRepository facilityRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final QrCodeService qrCodeService;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          FacilityService facilityService,
                          FacilityRepository facilityRepository,
                          ResourceRepository resourceRepository,
                          NotificationService notificationService,
                          QrCodeService qrCodeService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.facilityService = facilityService;
        this.facilityRepository = facilityRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
        this.qrCodeService = qrCodeService;
    }

    public BookingResponse createBooking(BookingCreateRequest request, User currentUser) {
        BookableFacilityContext context = resolveBookableFacilityContext(request.facilityId());
        validateTimeRange(request.startTime(), request.endTime());
        validateAvailabilityWindow(
            request.startTime(),
            request.endTime(),
            context.availabilityStart(),
            context.availabilityEnd()
        );

        boolean hasConflict = bookingRepository.existsOverlappingBookings(
            context.facility(),
                request.startTime(),
                request.endTime(),
                Set.of(BookingStatus.PENDING, BookingStatus.APPROVED)
        );
        if (hasConflict) {
            throw new BadRequestException("Selected facility has an overlapping booking for the requested period");
        }

        Booking booking = new Booking();
        booking.setFacility(context.facility());
        booking.setRequester(currentUser);
        booking.setPurpose(request.purpose());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setStatus(BookingStatus.PENDING);
        booking.setQrCodeToken(null);
        booking.setCheckedInAt(null);

        Booking saved = bookingRepository.save(booking);

        userRepository.findByRole(Role.ADMIN).forEach(admin ->
                notificationService.create(
                        admin,
                        "New facility booking request",
                    currentUser.getFullName() + " requested " + context.facility().getName(),
                        NotificationType.BOOKING_CREATED,
                        String.valueOf(saved.getId())
                )
        );

        return map(saved);
    }

    public List<BookingResponse> getBookings(User currentUser,
                                             String status,
                                             java.time.LocalDate startDate,
                                             String facilityFilter,
                                             String userFilter) {
        if (currentUser.getRole() == Role.ADMIN) {
            Stream<Booking> stream = bookingRepository.findAllByOrderByCreatedAtDesc().stream();

            if (hasText(status) && !"ALL".equalsIgnoreCase(status)) {
                BookingStatus parsedStatus;
                try {
                    parsedStatus = BookingStatus.valueOf(status.trim().toUpperCase());
                } catch (IllegalArgumentException ex) {
                    throw new BadRequestException("Invalid booking status: " + status);
                }
                stream = stream.filter(booking -> booking.getStatus() == parsedStatus);
            }

            if (startDate != null) {
                stream = stream.filter(booking -> {
                    var bookingDate = booking.getStartTime().toLocalDate();
                    return !bookingDate.isBefore(startDate);
                });
            }

            if (hasText(facilityFilter)) {
                String normalizedFacility = facilityFilter.trim().toLowerCase();
                stream = stream.filter(booking -> booking.getFacility() != null
                        && booking.getFacility().getName() != null
                        && booking.getFacility().getName().toLowerCase().contains(normalizedFacility));
            }

            if (hasText(userFilter)) {
                String normalizedUser = userFilter.trim().toLowerCase();
                stream = stream.filter(booking -> {
                    User requester = booking.getRequester();
                    return requester != null && (
                            containsIgnoreCase(requester.getFullName(), normalizedUser)
                                    || containsIgnoreCase(requester.getEmail(), normalizedUser)
                    );
                });
            }

            return stream.map(this::map).toList();
        }
        return bookingRepository.findByRequesterOrderByCreatedAtDesc(currentUser).stream().map(this::map).toList();
    }

    public List<BookingResponse> getMyBookings(User currentUser) {
        return bookingRepository.findByRequesterOrderByCreatedAtDesc(currentUser).stream().map(this::map).toList();
    }

    public BookingResponse decideBooking(Long id, BookingDecisionRequest request, User currentUser) {
        requireAdmin(currentUser);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (request.status() != BookingStatus.APPROVED && request.status() != BookingStatus.REJECTED) {
            throw new BadRequestException("Booking decision must be APPROVED or REJECTED");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved or rejected");
        }
        if (request.status() == BookingStatus.REJECTED && (request.reason() == null || request.reason().isBlank())) {
            throw new BadRequestException("A reason is required when rejecting a booking");
        }

        if (request.status() == BookingStatus.APPROVED) {
            boolean hasApprovedConflict = bookingRepository.existsOverlappingBookingsExcludingId(
                    booking.getId(),
                    booking.getFacility(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    Set.of(BookingStatus.APPROVED)
            );
            if (hasApprovedConflict) {
                throw new BadRequestException("Cannot approve because an overlapping booking is already approved");
            }
        }

        booking.setStatus(request.status());
        if (request.status() == BookingStatus.APPROVED) {
            booking.setQrCodeToken(generateQrCodeToken());
            booking.setCheckedInAt(null);
        } else {
            booking.setQrCodeToken(null);
            booking.setCheckedInAt(null);
        }
        booking.setDecisionReason(request.reason());
        Booking saved = bookingRepository.save(booking);

        notificationService.create(
                booking.getRequester(),
                "Booking status updated",
                "Your booking #" + booking.getId() + " is " + booking.getStatus().name(),
                NotificationType.BOOKING_UPDATED,
                String.valueOf(booking.getId())
        );

        return map(saved);
    }

    public BookingQrResponse generateQrCode(Long id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        requireOwnerOrAdmin(booking, currentUser);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("QR is only available for approved bookings");
        }

        if (!hasText(booking.getQrCodeToken())) {
            booking.setQrCodeToken(generateQrCodeToken());
            bookingRepository.save(booking);
        }

        String imageBase64 = qrCodeService.toBase64Png(booking.getQrCodeToken());
        return new BookingQrResponse(booking.getId(), booking.getQrCodeToken(), imageBase64);
    }

    public BookingResponse checkInBooking(String qrCodeToken, User currentUser) {
        if (!hasText(qrCodeToken)) {
            throw new BadRequestException("QR code is required");
        }

        Booking booking = bookingRepository.findByQrCodeToken(qrCodeToken.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR code"));

        requireOwnerOrAdmin(booking, currentUser);

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new BadRequestException("Booking is already checked in");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be checked in");
        }

        validateCheckInTimeWindow(booking);

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.create(
                booking.getRequester(),
                "Booking checked in",
                "Booking #" + booking.getId() + " has been checked in",
                NotificationType.BOOKING_UPDATED,
                String.valueOf(booking.getId())
        );

        return map(saved);
    }

    public BookingResponse cancelBooking(Long id, String reason, User currentUser) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isOwner = booking.getRequester().getId().equals(currentUser.getId());
        if (!(isOwner || currentUser.getRole() == Role.ADMIN)) {
            throw new ForbiddenOperationException("Only the booking owner or admin can cancel this booking");
        }
        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setDecisionReason(reason == null || reason.isBlank() ? "Cancelled by user" : reason);
        Booking saved = bookingRepository.save(booking);

        if (currentUser.getRole() != Role.ADMIN) {
            userRepository.findByRole(Role.ADMIN).forEach(admin ->
                    notificationService.create(
                            admin,
                            "Booking cancelled",
                            currentUser.getFullName() + " cancelled booking #" + booking.getId(),
                            NotificationType.BOOKING_UPDATED,
                            String.valueOf(booking.getId())
                    )
            );
        }

        return map(saved);
    }

    private BookingResponse map(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                facilityService.map(booking.getFacility()),
                map(booking.getRequester()),
                booking.getPurpose(),
                booking.getStartTime().toString(),
                booking.getEndTime().toString(),
                booking.getStatus().name(),
                booking.getDecisionReason(),
                booking.getCreatedAt().toString(),
                booking.getUpdatedAt().toString()
        );
    }

    private UserSummaryResponse map(User user) {
        return new UserSummaryResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    private BookableFacilityContext resolveBookableFacilityContext(Long selectedId) {
        Facility facility = facilityRepository.findById(selectedId).orElse(null);
        if (facility != null) {
            if (!facility.isActive()) {
                throw new ForbiddenOperationException("This facility is currently unavailable for booking");
            }

            Resource availabilitySource = resourceRepository.findById(selectedId)
                    .orElseGet(() -> resourceRepository
                            .findFirstByNameIgnoreCaseAndTypeIgnoreCaseAndLocationIgnoreCase(
                                    facility.getName(),
                                    facility.getType(),
                                    facility.getLocation()
                            )
                            .orElse(null));

            if (availabilitySource == null) {
                throw new BadRequestException("Facility availability window is not configured");
            }
            if (availabilitySource.getStatus() != Status.ACTIVE) {
                throw new ForbiddenOperationException("This facility is currently unavailable for booking");
            }

            return new BookableFacilityContext(
                    facility,
                    availabilitySource.getAvailabilityStart(),
                    availabilitySource.getAvailabilityEnd()
            );
        }

        Resource resource = resourceRepository.findById(selectedId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));

        if (resource.getStatus() != Status.ACTIVE) {
            throw new ForbiddenOperationException("This facility is currently unavailable for booking");
        }

        Facility existing = facilityRepository.findFirstByNameIgnoreCaseAndTypeIgnoreCaseAndLocationIgnoreCase(
                resource.getName(),
                resource.getType(),
                resource.getLocation()
        );
        if (existing != null) {
            if (!existing.isActive()) {
                throw new ForbiddenOperationException("This facility is currently unavailable for booking");
            }
            return new BookableFacilityContext(
                    existing,
                    resource.getAvailabilityStart(),
                    resource.getAvailabilityEnd()
            );
        }

        Facility generated = new Facility();
        generated.setName(resource.getName());
        generated.setType(resource.getType());
        generated.setLocation(resource.getLocation());
        generated.setCapacity(resource.getCapacity());
        generated.setDescription("Auto-created from active resource catalogue");
        generated.setActive(true);
        return new BookableFacilityContext(
                facilityRepository.save(generated),
                resource.getAvailabilityStart(),
                resource.getAvailabilityEnd()
        );
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Booking end time must be after start time");
        }
    }

    private void validateAvailabilityWindow(
            LocalDateTime startTime,
            LocalDateTime endTime,
            LocalTime availabilityStart,
            LocalTime availabilityEnd
    ) {
        if (availabilityStart == null || availabilityEnd == null) {
            throw new BadRequestException("Facility availability window is not configured");
        }

        LocalTime requestedStartTime = startTime.toLocalTime();
        LocalTime requestedEndTime = endTime.toLocalTime();

        boolean startInsideWindow = isWithinAvailabilityWindow(requestedStartTime, availabilityStart, availabilityEnd);
        boolean endInsideWindow = isWithinAvailabilityWindow(requestedEndTime, availabilityStart, availabilityEnd);

        if (!startInsideWindow || !endInsideWindow) {
            throw new BadRequestException("Booking time must be within the facility availability window");
        }
    }

    private boolean isWithinAvailabilityWindow(LocalTime candidate, LocalTime availabilityStart, LocalTime availabilityEnd) {
        // Supports both normal windows (08:00-18:00) and overnight windows (22:00-02:00).
        if (!availabilityStart.isAfter(availabilityEnd)) {
            return !candidate.isBefore(availabilityStart) && !candidate.isAfter(availabilityEnd);
        }
        return !candidate.isBefore(availabilityStart) || !candidate.isAfter(availabilityEnd);
    }

    private void requireAdmin(User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenOperationException("Only admins can perform this action");
        }
    }

    private void requireOwnerOrAdmin(Booking booking, User currentUser) {
        boolean isOwner = booking.getRequester().getId().equals(currentUser.getId());
        if (!isOwner && currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenOperationException("Only the booking owner or admin can perform this action");
        }
    }

    private void validateCheckInTimeWindow(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime allowedFrom = booking.getStartTime().minusMinutes(15);
        LocalDateTime allowedUntil = booking.getEndTime().plusMinutes(15);
        if (now.isBefore(allowedFrom) || now.isAfter(allowedUntil)) {
            throw new BadRequestException("Check-in is allowed only within booking time and 15 minutes grace period");
        }
    }

    private String generateQrCodeToken() {
        return UUID.randomUUID().toString();
    }

    private boolean containsIgnoreCase(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private record BookableFacilityContext(
            Facility facility,
            LocalTime availabilityStart,
            LocalTime availabilityEnd
    ) {
    }
}

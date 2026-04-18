package com.smartcampus.controller;

import com.smartcampus.dto.booking.BookingCancelRequest;
import com.smartcampus.dto.booking.BookingCreateRequest;
import com.smartcampus.dto.booking.BookingDecisionRequest;
import com.smartcampus.dto.booking.BookingResponse;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    public BookingController(BookingService bookingService, AuthService authService) {
        this.bookingService = bookingService;
        this.authService = authService;
    }

    @PostMapping
    public BookingResponse create(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return bookingService.createBooking(request, currentUser);
    }

    @GetMapping
    public List<BookingResponse> getBookings(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) String facility,
            @RequestParam(required = false) String user
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return bookingService.getBookings(currentUser, status, startDate, facility, user);
    }

    @GetMapping("/mine")
    public List<BookingResponse> getMine(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return bookingService.getMyBookings(currentUser);
    }

    @PatchMapping("/{id}/decision")
    public BookingResponse decide(
            @PathVariable Long id,
            @Valid @RequestBody BookingDecisionRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return bookingService.decideBooking(id, request, currentUser);
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancel(
            @PathVariable Long id,
            @RequestBody(required = false) BookingCancelRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        String reason = request == null ? null : request.reason();
        return bookingService.cancelBooking(id, reason, currentUser);
    }
}

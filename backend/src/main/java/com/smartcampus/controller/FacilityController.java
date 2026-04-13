package com.smartcampus.controller;

import com.smartcampus.dto.booking.FacilityRequest;
import com.smartcampus.dto.booking.FacilityResponse;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.FacilityService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;
    private final AuthService authService;

    public FacilityController(FacilityService facilityService, AuthService authService) {
        this.facilityService = facilityService;
        this.authService = authService;
    }

    @GetMapping
    public List<FacilityResponse> getFacilities(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return facilityService.getFacilities(currentUser);
    }

    @GetMapping("/{id}")
    public FacilityResponse getById(@PathVariable Long id, Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return facilityService.getById(id, currentUser);
    }

    @PostMapping
    public FacilityResponse create(
            @Valid @RequestBody FacilityRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return facilityService.createFacility(request, currentUser);
    }

    @PutMapping("/{id}")
    public FacilityResponse update(
            @PathVariable Long id,
            @Valid @RequestBody FacilityRequest request,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return facilityService.updateFacility(id, request, currentUser);
    }
}

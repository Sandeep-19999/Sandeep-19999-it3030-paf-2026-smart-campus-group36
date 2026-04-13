package com.smartcampus.service;

import com.smartcampus.dto.booking.FacilityRequest;
import com.smartcampus.dto.booking.FacilityResponse;
import com.smartcampus.entity.Facility;
import com.smartcampus.entity.User;
import com.smartcampus.enums.Role;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.FacilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public List<FacilityResponse> getFacilities(User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return facilityRepository.findAllByOrderByNameAsc().stream().map(this::map).toList();
        }
        return facilityRepository.findByActiveTrueOrderByNameAsc().stream().map(this::map).toList();
    }

    public FacilityResponse getById(Long id, User currentUser) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));
        if (!facility.isActive() && currentUser.getRole() != Role.ADMIN) {
            throw new ResourceNotFoundException("Facility not found");
        }
        return map(facility);
    }

    public FacilityResponse createFacility(FacilityRequest request, User currentUser) {
        requireAdmin(currentUser);
        Facility facility = new Facility();
        applyRequest(facility, request);
        return map(facilityRepository.save(facility));
    }

    public FacilityResponse updateFacility(Long id, FacilityRequest request, User currentUser) {
        requireAdmin(currentUser);
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));
        applyRequest(facility, request);
        return map(facilityRepository.save(facility));
    }

    public Facility requireActiveFacility(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));
        if (!facility.isActive()) {
            throw new ForbiddenOperationException("This facility is currently unavailable for booking");
        }
        return facility;
    }

    public FacilityResponse map(Facility facility) {
        return new FacilityResponse(
                facility.getId(),
                facility.getName(),
                facility.getType(),
                facility.getLocation(),
                facility.getCapacity(),
                facility.getDescription(),
                facility.isActive(),
                facility.getCreatedAt().toString(),
                facility.getUpdatedAt().toString()
        );
    }

    private void applyRequest(Facility facility, FacilityRequest request) {
        facility.setName(request.name());
        facility.setType(request.type());
        facility.setLocation(request.location());
        facility.setCapacity(request.capacity());
        facility.setDescription(request.description());
        facility.setActive(request.active());
    }

    private void requireAdmin(User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenOperationException("Only admins can perform this action");
        }
    }
}

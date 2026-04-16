package com.smartcampus.service;

import com.smartcampus.dto.resource.ResourceUpsertRequest;
import com.smartcampus.entity.User;
import com.smartcampus.enums.Role;
import com.smartcampus.enums.Status;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getResources(String type, Integer minCapacity, String location, Status status) {
        Specification<Resource> specification = null;

        if (hasText(type)) {
            specification = and(specification, (root, query, cb) ->
                    cb.like(cb.lower(root.get("type")), "%" + type.trim().toLowerCase() + "%"));
        }

        if (minCapacity != null) {
            specification = and(specification, (root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
        }

        if (hasText(location)) {
            specification = and(specification, (root, query, cb) ->
                    cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
        }

        if (status != null) {
            specification = and(specification, (root, query, cb) -> cb.equal(root.get("status"), status));
        }

        return specification == null ? resourceRepository.findAll() : resourceRepository.findAll(specification);
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource createResource(ResourceUpsertRequest request, User currentUser) {
        requireAdmin(currentUser);
        Resource resource = new Resource();
        apply(resource, request);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, ResourceUpsertRequest request, User currentUser) {
        requireAdmin(currentUser);
        Resource existing = getResourceById(id);
        apply(existing, request);
        return resourceRepository.save(existing);
    }

    public void deleteResource(Long id, User currentUser) {
        requireAdmin(currentUser);
        Resource existing = getResourceById(id);
        resourceRepository.delete(existing);
    }

    private void apply(Resource resource, ResourceUpsertRequest request) {
        resource.setName(request.name().trim());
        resource.setType(request.type().trim());
        resource.setCapacity(request.capacity());
        resource.setLocation(request.location().trim());
        resource.setStatus(request.status());
        resource.setAvailabilityStart(request.availabilityStart());
        resource.setAvailabilityEnd(request.availabilityEnd());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private Specification<Resource> and(Specification<Resource> left, Specification<Resource> right) {
        return left == null ? right : left.and(right);
    }

    private void requireAdmin(User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ForbiddenOperationException("Only admins can manage resources");
        }
    }
}

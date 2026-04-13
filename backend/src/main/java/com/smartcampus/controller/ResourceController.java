package com.smartcampus.controller;

import com.smartcampus.dto.resource.ResourceUpsertRequest;
import com.smartcampus.enums.Status;
import com.smartcampus.model.Resource;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

	private final ResourceService resourceService;

	public ResourceController(ResourceService resourceService) {
		this.resourceService = resourceService;
	}

	@GetMapping
	public List<Resource> getResources(
			@RequestParam(required = false) String type,
			@RequestParam(required = false) Integer minCapacity,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) Status status
	) {
		return resourceService.getResources(type, minCapacity, location, status);
	}

	@GetMapping("/{id}")
	public Resource getResourceById(@PathVariable Long id) {
		return resourceService.getResourceById(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Resource createResource(@Valid @RequestBody ResourceUpsertRequest request) {
		return resourceService.createResource(request);
	}

	@PutMapping("/{id}")
	public Resource updateResource(@PathVariable Long id, @Valid @RequestBody ResourceUpsertRequest request) {
		return resourceService.updateResource(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteResource(@PathVariable Long id) {
		resourceService.deleteResource(id);
	}
}

package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {
	Optional<Resource> findFirstByNameIgnoreCaseAndTypeIgnoreCaseAndLocationIgnoreCase(String name, String type, String location);
}

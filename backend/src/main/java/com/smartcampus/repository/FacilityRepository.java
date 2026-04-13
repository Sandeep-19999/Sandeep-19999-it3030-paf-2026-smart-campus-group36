package com.smartcampus.repository;

import com.smartcampus.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByActiveTrueOrderByNameAsc();
    List<Facility> findAllByOrderByNameAsc();
}

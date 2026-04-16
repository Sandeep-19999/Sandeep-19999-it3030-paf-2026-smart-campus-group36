package com.smartcampus.repository;

import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatorOrderByCreatedAtDesc(User creator);
    List<Ticket> findByAssignedTechnicianOrderByCreatedAtDesc(User assignedTechnician);
    List<Ticket> findAllByOrderByCreatedAtDesc();
}

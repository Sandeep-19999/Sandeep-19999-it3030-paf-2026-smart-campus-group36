package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Facility;
import com.smartcampus.entity.User;
import com.smartcampus.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRequesterOrderByCreatedAtDesc(User requester);
    List<Booking> findAllByOrderByCreatedAtDesc();
        Optional<Booking> findByQrCodeToken(String qrCodeToken);

    @Query("""
            select case when count(b) > 0 then true else false end
            from Booking b
            where b.facility = :facility
            and b.status in :statuses
            and b.startTime < :endTime
            and b.endTime > :startTime
            """)
    boolean existsOverlappingBookings(
            @Param("facility") Facility facility,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses
    );

    @Query("""
            select case when count(b) > 0 then true else false end
            from Booking b
            where b.id <> :excludeId
            and b.facility = :facility
            and b.status in :statuses
            and b.startTime < :endTime
            and b.endTime > :startTime
            """)
    boolean existsOverlappingBookingsExcludingId(
            @Param("excludeId") Long excludeId,
            @Param("facility") Facility facility,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("statuses") Collection<BookingStatus> statuses
    );
}

package com.smartcampus.config;

import com.smartcampus.entity.Notification;
import com.smartcampus.entity.Facility;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.entity.User;
import com.smartcampus.enums.AuthProvider;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.enums.Role;
import com.smartcampus.enums.Status;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.FacilityRepository;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
                               FacilityRepository facilityRepository,
                               ResourceRepository resourceRepository,
                               BookingRepository bookingRepository,
                               TicketRepository ticketRepository,
                               TicketCommentRepository ticketCommentRepository,
                               NotificationRepository notificationRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            if (resourceRepository.count() == 0) {
                Resource projector = new Resource();
                projector.setName("Ceiling Projector");
                projector.setType("Projector");
                projector.setCapacity(80);
                projector.setLocation("Conference Room A");
                projector.setStatus(Status.ACTIVE);
                projector.setAvailabilityStart(LocalTime.of(8, 0));
                projector.setAvailabilityEnd(LocalTime.of(18, 0));
                resourceRepository.save(projector);

                Resource lab = new Resource();
                lab.setName("Computer Lab 03");
                lab.setType("Lab");
                lab.setCapacity(45);
                lab.setLocation("Engineering Block - Floor 1");
                lab.setStatus(Status.ACTIVE);
                lab.setAvailabilityStart(LocalTime.of(8, 0));
                lab.setAvailabilityEnd(LocalTime.of(18, 0));
                resourceRepository.save(lab);

                Resource meetingRoom = new Resource();
                meetingRoom.setName("Conference Room A");
                meetingRoom.setType("Meeting Room");
                meetingRoom.setCapacity(20);
                meetingRoom.setLocation("Administration Block - Level 2");
                meetingRoom.setStatus(Status.ACTIVE);
                meetingRoom.setAvailabilityStart(LocalTime.of(9, 0));
                meetingRoom.setAvailabilityEnd(LocalTime.of(17, 0));
                resourceRepository.save(meetingRoom);
            }

            if (userRepository.count() > 0) {
                return;
            }

            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setFullName("System Admin");
            admin.setEmail("it00000001@my.sliit.lk");
            admin.setUniversityId("IT00000001");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setAuthProvider(AuthProvider.LOCAL);
            userRepository.save(admin);

            User technician = new User();
            technician.setFirstName("Main");
            technician.setLastName("Technician");
            technician.setFullName("Main Technician");
            technician.setEmail("it00000002@my.sliit.lk");
            technician.setUniversityId("IT00000002");
            technician.setPasswordHash(passwordEncoder.encode("Tech@123"));
            technician.setRole(Role.TECHNICIAN);
            technician.setAuthProvider(AuthProvider.LOCAL);
            userRepository.save(technician);

            User student = new User();
            student.setFirstName("Campus");
            student.setLastName("User");
            student.setFullName("Campus User");
            student.setEmail("it00000003@my.sliit.lk");
            student.setUniversityId("IT00000003");
            student.setPasswordHash(passwordEncoder.encode("User@123"));
            student.setRole(Role.USER);
            student.setAuthProvider(AuthProvider.LOCAL);
            userRepository.save(student);

            Facility conferenceRoom = new Facility();
            conferenceRoom.setName("Conference Room A");
            conferenceRoom.setType("Meeting Room");
            conferenceRoom.setLocation("Administration Block - Level 2");
            conferenceRoom.setCapacity(20);
            conferenceRoom.setDescription("Project discussions, faculty meetings and presentations.");
            conferenceRoom.setActive(true);
            facilityRepository.save(conferenceRoom);

            Facility computerLab = new Facility();
            computerLab.setName("Computer Lab 03");
            computerLab.setType("Lab");
            computerLab.setLocation("Engineering Block - Floor 1");
            computerLab.setCapacity(45);
            computerLab.setDescription("Reserved for practical sessions and assessment activities.");
            computerLab.setActive(true);
            facilityRepository.save(computerLab);

            Booking booking = new Booking();
            booking.setFacility(conferenceRoom);
            booking.setRequester(student);
            booking.setPurpose("IEEE student branch planning session");
            booking.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));
            booking.setEndTime(LocalDateTime.now().plusDays(1).withHour(12).withMinute(0).withSecond(0).withNano(0));
            booking.setStatus(BookingStatus.PENDING);
            bookingRepository.save(booking);

            Ticket ticket = new Ticket();
            ticket.setTitle("Projector not working in Lab 03");
            ticket.setCategory("Equipment Fault");
            ticket.setDescription("The projector powers on but shows a blank screen during lectures.");
            ticket.setPriority(TicketPriority.HIGH);
            ticket.setStatus(TicketStatus.OPEN);
            ticket.setLocationLabel("Lab 03 - Engineering Block");
            ticket.setResourceName("Ceiling Projector");
            ticket.setPreferredContact("0771234567");
            ticket.setCreator(student);
            ticket.setAssignedTechnician(technician);
            ticketRepository.save(ticket);

            TicketComment comment = new TicketComment();
            comment.setTicket(ticket);
            comment.setAuthor(technician);
            comment.setContent("I will inspect this issue during the next maintenance round.");
            ticketCommentRepository.save(comment);

            Notification notification = new Notification();
            notification.setRecipient(student);
            notification.setTitle("Technician assigned");
            notification.setMessage("A technician was assigned to your ticket #" + ticket.getId());
            notification.setType(NotificationType.ASSIGNMENT);
            notification.setReferenceId(String.valueOf(ticket.getId()));
            notificationRepository.save(notification);
        };
    }
}

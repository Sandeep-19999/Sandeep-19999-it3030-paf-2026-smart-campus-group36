package com.smartcampus.service;

import com.smartcampus.dto.auth.AuthResponse;
import com.smartcampus.dto.auth.DevLoginRequest;
import com.smartcampus.dto.auth.MeResponse;
import com.smartcampus.dto.ticket.UserSummaryResponse;
import com.smartcampus.entity.User;
import com.smartcampus.enums.Role;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse devLogin(DevLoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public MeResponse mapMe(User user) {
        return new MeResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.getAvatarUrl(), user.getAuthProvider().name());
    }

    public List<UserSummaryResponse> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(user -> new UserSummaryResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name()))
                .toList();
    }
}

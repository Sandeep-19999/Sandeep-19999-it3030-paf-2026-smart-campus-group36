package com.smartcampus.service;

import com.smartcampus.dto.auth.AuthResponse;
import com.smartcampus.dto.auth.DevLoginRequest;
import com.smartcampus.dto.auth.MeResponse;
import com.smartcampus.dto.auth.RegisterRequest;
import com.smartcampus.dto.ticket.UserSummaryResponse;
import com.smartcampus.entity.User;
import com.smartcampus.enums.AuthProvider;
import com.smartcampus.enums.Role;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AuthService {

    private static final String ADMIN_REGISTRATION_PASSCODE = "1234";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FileStorageService fileStorageService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.fileStorageService = fileStorageService;
    }

    public AuthResponse devLogin(DevLoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        if (request.role() == Role.ADMIN) {
            validateAdminPasscode(request.adminPasscode());
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setRole(request.role());
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(token, "Bearer", savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole().name());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public MeResponse updateAvatar(User user, MultipartFile file) {
        String avatarUrl = fileStorageService.storeUserAvatar(user, file);
        user.setAvatarUrl(avatarUrl);
        User saved = userRepository.save(user);
        return mapMe(saved);
    }

    public MeResponse mapMe(User user) {
        return new MeResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), user.getAvatarUrl(), user.getAuthProvider().name());
    }

    public List<UserSummaryResponse> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(user -> new UserSummaryResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name()))
                .toList();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private void validateAdminPasscode(String passcode) {
        if (passcode == null || passcode.isBlank()) {
            throw new BadRequestException("Admin passcode is required for admin registration");
        }
        if (!ADMIN_REGISTRATION_PASSCODE.equals(passcode.trim())) {
            throw new BadRequestException("Invalid admin passcode");
        }
    }
}

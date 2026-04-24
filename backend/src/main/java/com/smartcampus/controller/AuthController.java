package com.smartcampus.controller;

import com.smartcampus.dto.auth.AuthResponse;
import com.smartcampus.dto.auth.DevLoginRequest;
import com.smartcampus.dto.auth.MeResponse;
import com.smartcampus.dto.auth.RegisterRequest;
import com.smartcampus.dto.ticket.UserSummaryResponse;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final FileStorageService fileStorageService;

    public AuthController(AuthService authService, FileStorageService fileStorageService) {
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/dev-login")
    public AuthResponse devLogin(@Valid @RequestBody DevLoginRequest request) {
        return authService.devLogin(request);
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return authService.mapMe(currentUser);
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MeResponse uploadAvatar(
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        User currentUser = authService.getCurrentUser(authentication.getName());
        return authService.updateAvatar(currentUser, file);
    }

    @GetMapping("/avatar/{userId}")
    public ResponseEntity<Resource> getAvatar(@PathVariable Long userId) {
        authService.getUserById(userId);
        Resource resource = fileStorageService.loadUserAvatarAsResource(userId);
        String contentType = fileStorageService.getUserAvatarContentType(userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/technicians")
    public List<UserSummaryResponse> technicians() {
        return authService.getTechnicians();
    }

    @GetMapping("/oauth-info")
    public Map<String, Object> oauthInfo() {
        return Map.of(
                "googleLoginUrl", "/oauth2/authorization/google",
                "note", "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google OAuth."
        );
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Client side token cleared successfully");
    }
}

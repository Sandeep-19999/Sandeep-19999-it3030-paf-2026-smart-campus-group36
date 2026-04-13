package com.smartcampus.controller;

import com.smartcampus.dto.auth.AuthResponse;
import com.smartcampus.dto.auth.DevLoginRequest;
import com.smartcampus.dto.auth.MeResponse;
import com.smartcampus.dto.auth.RegisterRequest;
import com.smartcampus.dto.ticket.UserSummaryResponse;
import com.smartcampus.entity.User;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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

    @GetMapping("/technicians")
    public List<UserSummaryResponse> technicians() {
        return authService.getTechnicians();
    }

    @GetMapping("/oauth-info")
    public Map<String, Object> oauthInfo() {
        return Map.of(
                "googleLoginUrl", "http://localhost:8080/oauth2/authorization/google",
                "note", "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google OAuth."
        );
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Client side token cleared successfully");
    }
}

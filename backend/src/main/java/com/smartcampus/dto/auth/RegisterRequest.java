package com.smartcampus.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 100) String fullName,
        @NotBlank
        @Pattern(
                regexp = "(?i)^IT\\d{8}@my\\.sliit\\.lk$",
                message = "Email must be in the format IT12345678@my.sliit.lk"
        )
        String email,
        @NotBlank
        @Size(min = 8, max = 72)
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,72}$",
                message = "Password must contain at least one letter, one number, and one special character"
        )
        String password,
        @NotBlank String confirmPassword
) {
}
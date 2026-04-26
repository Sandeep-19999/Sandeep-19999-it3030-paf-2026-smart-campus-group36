package com.smartcampus.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DevLoginRequest(
        @NotBlank(message = "Email is required")
        @Pattern(
                regexp = "(?i)^IT\\d{8}@my\\.sliit\\.lk$",
                message = "Email must be in the format IT23817180@my.sliit.lk"
        )
        String email,

        @NotBlank(message = "Password is required")
        String password
) {
}

package com.smartcampus.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DevLoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {
}

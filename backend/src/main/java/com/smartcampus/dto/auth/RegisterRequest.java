package com.smartcampus.dto.auth;

import com.smartcampus.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
        @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'-]*$", message = "First name can contain letters, spaces, hyphen and apostrophe only")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
        @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'-]*$", message = "Last name can contain letters, spaces, hyphen and apostrophe only")
        String lastName,

        @NotBlank(message = "IT number is required")
        @Pattern(
                regexp = "(?i)^IT\\d{8}$",
                message = "IT number must be in the format IT23817180"
        )
        String universityId,

        @NotBlank(message = "Email is required")
        @Pattern(
                regexp = "(?i)^IT\\d{8}@my\\.sliit\\.lk$",
                message = "Email must be in the format IT23817180@my.sliit.lk"
        )
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*#?&^._-])[A-Za-z\\d@$!%*#?&^._-]{8,72}$",
                message = "Password must include uppercase, lowercase, number and special character"
        )
        String password,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword,

        @NotNull(message = "Role is required")
        Role role,

        @Size(max = 120, message = "Admin passcode is too long")
        String adminPasscode
) {
}

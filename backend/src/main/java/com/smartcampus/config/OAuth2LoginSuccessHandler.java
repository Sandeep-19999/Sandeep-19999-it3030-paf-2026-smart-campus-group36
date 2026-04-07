package com.smartcampus.config;

import com.smartcampus.entity.User;
import com.smartcampus.enums.AuthProvider;
import com.smartcampus.enums.Role;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                     JwtService jwtService,
                                     @Value("${app.frontend-url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name != null ? name : email);
            newUser.setAvatarUrl(picture);
            newUser.setAuthProvider(AuthProvider.GOOGLE);
            newUser.setRole(Role.USER);
            return newUser;
        });
        user.setAvatarUrl(picture);
        user.setEnabled(true);
        user.setAuthProvider(AuthProvider.GOOGLE);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        response.sendRedirect(frontendUrl + "/oauth-success?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8));
    }
}

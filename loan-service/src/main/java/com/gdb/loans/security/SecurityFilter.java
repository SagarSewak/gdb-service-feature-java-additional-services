package com.gdb.loans.security;

import com.gdb.loans.client.AuthClient;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {
    private final AuthClient authClient;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())
                || path.contains("/api-docs") || path.contains("/swagger-ui")
                || path.contains("/actuator") || path.contains("/internal/")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            AuthClient.TokenValidationResponse resp = authClient.validateToken(authHeader.substring(7));
            if (resp != null && resp.isValid()) {
                UserContextHolder.setContext(UserContext.builder()
                    .userId(resp.getUserId()).loginId(resp.getLoginId()).role(resp.getRole()).build());
            } else {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing Authorization header");
            return;
        }
        try {
            chain.doFilter(request, response);
        } finally {
            UserContextHolder.clearContext();
        }
    }
}

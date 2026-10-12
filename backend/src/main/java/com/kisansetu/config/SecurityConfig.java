package com.kisansetu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.disable())) // For H2 console
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow all CORS preflight OPTIONS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public authentication & health check
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // Public browsing for marketplace & market prices
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/market-prices/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/ai/explain-price").permitAll()

                // Farmer Profile, alerts, sessions and feedback
                .requestMatchers("/api/profile/**").permitAll()
                .requestMatchers("/api/history/**").permitAll()
                .requestMatchers("/api/proactive_alerts/**").permitAll()
                .requestMatchers("/feedback/**").permitAll()
                .requestMatchers("/apps/**").permitAll()

                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Everything else requires valid authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Build allowed origins from the env var (comma-separated) + always include localhost
        List<String> origins = new java.util.ArrayList<>(Arrays.asList(allowedOrigins.split(",")));
        // Always allow local development
        configuration.setAllowedOriginPatterns(origins.isEmpty()
            ? List.of("http://localhost:*", "http://127.0.0.1:*", "https://*.vercel.app")
            : origins.stream().map(String::trim).collect(java.util.stream.Collectors.toList()));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

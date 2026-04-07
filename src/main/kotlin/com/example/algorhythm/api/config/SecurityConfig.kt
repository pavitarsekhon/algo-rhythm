package com.example.algorhythm.api.config

import com.example.algorhythm.api.security.JwtUtil
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.OncePerRequestFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(private val jwtUtil: JwtUtil) {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOriginPatterns = listOf("*")
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                    .requestMatchers("/api/chat").permitAll()
                    .requestMatchers("/api/questions/run").permitAll()
                    .anyRequest().authenticated()
            }
            .addFilterBefore(JwtFilter(jwtUtil), UsernamePasswordAuthenticationFilter::class.java)
            .build()
    }

    class JwtFilter(private val jwtUtil: JwtUtil) : OncePerRequestFilter() {
        override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain
        ) {
            // Skip JWT validation for OPTIONS requests (CORS preflight)
            if (request.method == "OPTIONS") {
                filterChain.doFilter(request, response)
                return
            }

            // Skip JWT validation for auth endpoints
            if (request.requestURI.startsWith("/api/auth/")) {
                filterChain.doFilter(request, response)
                return
            }

            val header = request.getHeader("Authorization")
            if (header != null && header.startsWith("Bearer ")) {
                val token = header.substring(7)
                try {
                    val username = jwtUtil.extractUsername(token)
                    if (username != null && SecurityContextHolder.getContext().authentication == null) {
                        val auth = UsernamePasswordAuthenticationToken(username, null, emptyList())
                        SecurityContextHolder.getContext().authentication = auth
                    }
                } catch (_: Exception) {
                    // Invalid token - continue without auth
                }
            }
            filterChain.doFilter(request, response)
        }
    }
}
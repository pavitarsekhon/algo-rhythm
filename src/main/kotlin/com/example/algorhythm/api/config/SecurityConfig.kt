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
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.filter.OncePerRequestFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(private val jwtUtil: JwtUtil) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .authorizeHttpRequests {
                it.requestMatchers("/api/auth/**").permitAll()
                it.requestMatchers("/api/chat").permitAll()   // 👈 place BEFORE anyRequest
                it.requestMatchers("/api/questions/run").permitAll() // optional if needed
                it.requestMatchers("/api/questions/submit").authenticated()
                it.requestMatchers("/api/questions/next").authenticated()

                it.anyRequest().authenticated()              // 👈 ALWAYS LAST
            }
            .addFilterBefore(JwtFilter(jwtUtil), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    class JwtFilter(private val jwtUtil: JwtUtil) : OncePerRequestFilter() {
        override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain
        ) {
            val header = request.getHeader("Authorization")
            if (header != null && header.startsWith("Bearer ")) {
                val token = header.substring(7)
                val username = jwtUtil.extractUsername(token)
                if (username != null) {
                    val auth = UsernamePasswordAuthenticationToken(username, null, listOf())
                    SecurityContextHolder.getContext().authentication = auth
                }
            }
            filterChain.doFilter(request, response)
        }
    }
}

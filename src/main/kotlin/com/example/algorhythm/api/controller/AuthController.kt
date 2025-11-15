package com.example.algorhythm.api.controller

import com.example.algorhythm.api.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/register")
    fun register(@RequestBody req: AuthRequest): ResponseEntity<String> {
        authService.register(req.username, req.password)
        return ResponseEntity.ok("User registered successfully")
    }

    @PostMapping("/login")
    fun login(@RequestBody req: AuthRequest): ResponseEntity<AuthResponse> {
        val token = authService.login(req.username, req.password)
        return ResponseEntity.ok(AuthResponse(token))
    }
}

data class AuthRequest(
    val username: String,
    val password: String
)

data class AuthResponse(
    val token: String
)
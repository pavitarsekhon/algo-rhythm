package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.security.JwtUtil
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val jwtUtil: JwtUtil
) {
    private val passwordEncoder = BCryptPasswordEncoder()

    fun register(username: String, password: String): User {
        if (userRepository.findByUsername(username).isPresent) {
            throw IllegalArgumentException("Username already exists")
        }
        val hashedPassword = passwordEncoder.encode(password)
        val user = User(username = username, password = hashedPassword)
        return userRepository.save(user)
    }

    fun login(username: String, password: String): String {
        val user = userRepository.findByUsername(username)
            .orElseThrow { IllegalArgumentException("Invalid username or password") }

        if (!passwordEncoder.matches(password, user.password))
            throw IllegalArgumentException("Invalid username or password")

        return jwtUtil.generateToken(username)
    }
}
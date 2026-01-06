package com.example.algorhythm.api.service

import com.example.algorhythm.api.controller.AuthRequest
import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.domain.UserSession
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.security.JwtUtil
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val userSessionRepository: UserSessionRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    fun register(req: AuthRequest): User {
        val username = req.username
        val password = req.password
        if (userRepository.findByUsername(username).isPresent) {
            throw IllegalArgumentException("Username already exists")
        }
        val hashedPassword = passwordEncoder.encode(password)
        val user = User(username = username, password = hashedPassword, age = req.age, knownLanguages = req.knownLanguages, experienceLevel = req.experienceLevel)
        val savedUser = userRepository.save(user)
        val userSession = UserSession(
            user = savedUser,
            active = true,
            currentQuestionId = 1
        )
        userSessionRepository.save(userSession)
        return savedUser
    }

    fun login(username: String, password: String): String {
        val user = userRepository.findByUsername(username)
            .orElseThrow { IllegalArgumentException("Invalid username or password") }

        // log hash prefix and length and whether the provided password matches the stored hash.
        val storedHash = user.password
        val prefix = if (storedHash.length >= 4) storedHash.take(4) else storedHash
        val hashLen = storedHash.length
        val matches = passwordEncoder.matches(password, storedHash)
        logger.debug("Auth attempt username='{}' -> found=true, hashPrefix='{}', hashLen={}, matches={}", username, prefix, hashLen, matches)

        if (!matches)
            throw IllegalArgumentException("Invalid username or password")

        return jwtUtil.generateToken(username)
    }
}
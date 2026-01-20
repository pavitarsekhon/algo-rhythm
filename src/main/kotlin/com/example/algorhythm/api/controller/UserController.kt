package com.example.algorhythm.api.controller

import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userRepository: UserRepository,
    private val userSessionRepository: UserSessionRepository
) {

    @GetMapping("/profile")
    fun getProfile(): ResponseEntity<UserProfileResponse> {
        val username = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: return ResponseEntity.status(401).build()

        val user = userRepository.findByUsername(username).orElse(null)
            ?: return ResponseEntity.status(404).build()

        val session = userSessionRepository.findByUserId(user.id)

        return ResponseEntity.ok(
            UserProfileResponse(
                username = user.username,
                age = user.age,
                experienceLevel = user.experienceLevel,
                knownLanguages = user.knownLanguages,
                isAdmin = user.isAdmin,
                totalCorrect = session?.totalCorrect ?: 0,
                totalAttempts = session?.totalAttempts ?: 0,
                currentDifficulty = session?.currentDifficulty?.toString() ?: "Easy",
                successRate = if ((session?.totalAttempts ?: 0) > 0) {
                    ((session?.totalCorrect ?: 0).toDouble() / session!!.totalAttempts * 100).toInt()
                } else 0
            )
        )
    }
}

data class UserProfileResponse(
    val username: String,
    val age: Int?,
    val experienceLevel: String?,
    val knownLanguages: String?,
    val isAdmin: Boolean,
    val totalCorrect: Int,
    val totalAttempts: Int,
    val currentDifficulty: String,
    val successRate: Int
)


package com.example.algorhythm.api.service

import com.example.algorhythm.api.repository.UserSessionRepository
import org.springframework.stereotype.Service

@Service
class UserSessionService(
    private val userSessionRepository: UserSessionRepository
) {
    fun incrementTotalAttempts(userId: Long) {
        val userSession = userSessionRepository.findByUserId(userId)
            ?: error("User session not found")
        userSession.totalAttempts += 1
        userSessionRepository.save(userSession)
    }
}
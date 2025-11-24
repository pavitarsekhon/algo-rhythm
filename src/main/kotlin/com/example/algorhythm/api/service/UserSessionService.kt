package com.example.algorhythm.api.service

import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.UserSessionRepository
import org.springframework.stereotype.Service

@Service
class UserSessionService(
    private val userSessionRepository: UserSessionRepository
) {
    fun increaseDifficulty() {
        val user = userSessionRepository.findByActiveIsTrue()
        if (user.currentDifficulty == QuestionDifficulty.EASY) {
            user.currentDifficulty = QuestionDifficulty.MEDIUM
            userSessionRepository.save(user)
            return
        }
        if (user.currentDifficulty == QuestionDifficulty.MEDIUM) {
            user.currentDifficulty = QuestionDifficulty.HARD
            userSessionRepository.save(user)
            return
        }
        if (user.currentDifficulty == QuestionDifficulty.HARD) {
            user.currentDifficulty = QuestionDifficulty.HARD
            return
        }
    }
}
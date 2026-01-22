package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.domain.UserProgress
import com.example.algorhythm.api.repository.UserProgressRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserProgressService(
    private val userProgressRepository: UserProgressRepository
) {

    fun getOrCreateProgress(user: User): UserProgress {
        return userProgressRepository.findByUserId(user.id)
            ?: userProgressRepository.save(UserProgress(user = user))
    }

    @Transactional
    fun recordCompletion(user: User, difficulty: String, topics: String?) {
        val progress = getOrCreateProgress(user)

        // Increment difficulty count
        progress.incrementDifficultyCount(difficulty)

        // Increment topic counts (topics are pipe-separated like "Array|String|Two Pointers")
        topics?.split("|")?.forEach { topic ->
            progress.incrementTopicCount(topic.trim())
        }

        userProgressRepository.save(progress)
    }

    fun getProgressByUserId(userId: Long): UserProgress? {
        return userProgressRepository.findByUserId(userId)
    }
}


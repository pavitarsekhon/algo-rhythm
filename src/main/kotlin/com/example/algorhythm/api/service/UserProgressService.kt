package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.domain.UserProgress
import com.example.algorhythm.api.repository.UserProgressRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import kotlin.math.roundToInt

@Service
class UserProgressService(
    private val userProgressRepository: UserProgressRepository
) {
    private val mapper = jacksonObjectMapper()


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

    fun getTopicProgressMap(progress: UserProgress): Map<String, Int> {
        return parseTopicProgress(progress.topicProgressJson)
    }

    @Transactional
    fun updateTopicProgress(user: User, topicKey: String, quizScore: Int, alpha: Double = 0.5): TopicProgressUpdate {
        val progress = getOrCreateProgress(user)
        val topicProgress = parseTopicProgress(progress.topicProgressJson).toMutableMap()

        val previous = topicProgress[topicKey] ?: 0
        val smoothed = (previous + alpha * (quizScore - previous)).roundToInt().coerceIn(0, 100)
        topicProgress[topicKey] = smoothed

        progress.topicProgressJson = mapper.writeValueAsString(topicProgress)
        userProgressRepository.save(progress)

        return TopicProgressUpdate(previous = previous, updated = smoothed)
    }

    private fun parseTopicProgress(json: String?): Map<String, Int> {
        if (json.isNullOrBlank()) {
            return emptyMap()
        }
        return try {
            mapper.readValue<Map<String, Int>>(json)
        } catch (_: Exception) {
            emptyMap()
        }
    }
}

data class TopicProgressUpdate(
    val previous: Int,
    val updated: Int
)


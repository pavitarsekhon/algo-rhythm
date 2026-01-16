package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.domain.UserSession
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import org.springframework.stereotype.Service

@Service
class AdminService(
    private val userRepository: UserRepository,
    private val userSessionRepository: UserSessionRepository,
    private val questionRepository: QuestionRepository
) {

    fun isAdmin(username: String): Boolean {
        val user = userRepository.findByUsername(username).orElse(null)
        return user?.isAdmin == true
    }

    fun getAllUsers(): List<UserDTO> {
        return userRepository.findAll().map { user ->
            val session = userSessionRepository.findByUserId(user.id)
            UserDTO(
                id = user.id,
                username = user.username,
                age = user.age,
                experienceLevel = user.experienceLevel,
                knownLanguages = user.knownLanguages,
                isAdmin = user.isAdmin,
                totalAttempts = session?.totalAttempts ?: 0,
                totalCorrect = session?.totalCorrect ?: 0
            )
        }
    }

    fun getUserById(userId: Long): UserDTO? {
        val user = userRepository.findById(userId).orElse(null) ?: return null
        val session = userSessionRepository.findByUserId(user.id)
        return UserDTO(
            id = user.id,
            username = user.username,
            age = user.age,
            experienceLevel = user.experienceLevel,
            knownLanguages = user.knownLanguages,
            isAdmin = user.isAdmin,
            totalAttempts = session?.totalAttempts ?: 0,
            totalCorrect = session?.totalCorrect ?: 0
        )
    }

    fun setAdminStatus(userId: Long, isAdmin: Boolean): UserDTO? {
        val user = userRepository.findById(userId).orElse(null) ?: return null
        user.isAdmin = isAdmin
        userRepository.save(user)
        return getUserById(userId)
    }

    fun deleteUser(userId: Long): Boolean {
        if (!userRepository.existsById(userId)) return false
        val session = userSessionRepository.findByUserId(userId)
        if (session != null) {
            userSessionRepository.delete(session)
        }
        userRepository.deleteById(userId)
        return true
    }

    fun getAllQuestions(): List<Question> {
        return questionRepository.findAll()
    }

    fun getStats(): AdminStatsDTO {
        val users = userRepository.findAll()
        val questions = questionRepository.findAll()
        val sessions = userSessionRepository.findAll()

        val totalAttempts = sessions.sumOf { it.totalAttempts }
        val totalCorrect = sessions.sumOf { it.totalCorrect }

        return AdminStatsDTO(
            totalUsers = users.size,
            totalQuestions = questions.size,
            totalAdmins = users.count { it.isAdmin },
            totalAttempts = totalAttempts,
            totalCorrect = totalCorrect,
            successRate = if (totalAttempts > 0) (totalCorrect.toDouble() / totalAttempts * 100).toInt() else 0
        )
    }
}

data class UserDTO(
    val id: Long,
    val username: String,
    val age: Int?,
    val experienceLevel: String?,
    val knownLanguages: String?,
    val isAdmin: Boolean,
    val totalAttempts: Int,
    val totalCorrect: Int
)

data class AdminStatsDTO(
    val totalUsers: Int,
    val totalQuestions: Int,
    val totalAdmins: Int,
    val totalAttempts: Int,
    val totalCorrect: Int,
    val successRate: Int
)


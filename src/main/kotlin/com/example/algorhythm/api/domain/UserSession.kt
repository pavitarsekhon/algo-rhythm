package com.example.algorhythm.api.domain

import com.example.algorhythm.api.enum.QuestionDifficulty
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import java.util.UUID

@Entity
data class UserSession(

    @Id
    val sessionId: String = UUID.randomUUID().toString(),

    val active: Boolean = false,

    var currentQuestionId: Long? = null,

    @Enumerated(EnumType.STRING)
    var currentDifficulty: QuestionDifficulty = QuestionDifficulty.EASY,

    var correctLastAnswer: Boolean = false,

    var totalCorrect: Int = 0,
    var totalAttempts: Int = 0
)

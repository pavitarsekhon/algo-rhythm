package com.example.algorhythm.api.domain

import com.example.algorhythm.api.enum.QuestionDifficulty
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import java.util.UUID

data class UserSession(

    @Id
    val sessionId: String = UUID.randomUUID().toString(),

    var currentQuestionId: Long? = null,

    @Enumerated(EnumType.STRING)
    var currentDifficulty: QuestionDifficulty = QuestionDifficulty.EASY,

    var correctLastAnswer: Boolean = false,

    var totalCorrect: Int = 0,
    var totalAttempts: Int = 0
)

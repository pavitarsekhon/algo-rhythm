package com.example.algorhythm.api.domain

import com.example.algorhythm.api.enum.QuestionDifficulty
import jakarta.persistence.*
import java.util.UUID

@Entity
data class UserSession(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    val active: Boolean = false,

    var currentQuestionId: Long? = null,

    @Enumerated(EnumType.STRING)
    var currentDifficulty: QuestionDifficulty = QuestionDifficulty.EASY,

    var correctLastAnswer: Boolean = false,

    var totalCorrect: Int = 0,
    var totalAttempts: Int = 0
)

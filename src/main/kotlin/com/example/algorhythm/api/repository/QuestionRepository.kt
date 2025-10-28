package com.example.algorhythm.api.repository

import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.enum.QuestionDifficulty
import org.springframework.data.jpa.repository.JpaRepository

interface QuestionRepository : JpaRepository<Question, Long> {
    fun findByDifficulty(difficulty: QuestionDifficulty): List<Question>
}
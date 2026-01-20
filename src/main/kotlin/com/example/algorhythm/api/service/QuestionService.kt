package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class QuestionService(
    private val questionRepository: QuestionRepository,
) {

    fun generateQuestion(difficulty: QuestionDifficulty, userLevel: String): Question {

        val questions = questionRepository.findByDifficulty(difficulty)
        if (questions.isNotEmpty()) {
            return questions.random()
        }
        throw IllegalArgumentException("No questions available for difficulty: $difficulty")
    }

}

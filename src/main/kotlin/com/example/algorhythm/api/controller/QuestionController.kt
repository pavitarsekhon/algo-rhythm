package com.example.algorhythm.api.controller

import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/questions")
class QuestionController (
    private val questionRepository: QuestionRepository
) {

    @GetMapping("/next")
    fun getNextQuestion(): com.example.algorhythm.api.domain.Question? {

        // random difficulty for mvp - will add adaptive difficulty later on
        val difficulty = QuestionDifficulty.entries.random()
        val questions = questionRepository.findByDifficulty(difficulty)

        if (questions.isEmpty()) {
            error("No entries were extracted from db")
        }

        return questions.first()
    }
}
package com.example.algorhythm.api.controller

import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.service.Judge0Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.service.SubmitResultResponse
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody


@RestController
@RequestMapping("/api/questions")
class QuestionController (
    private val questionRepository: QuestionRepository,
    private val judge0Service: Judge0Service,
) {

    @GetMapping("/next")
    fun getNextQuestion(): Question? {
        // clear code window
        // random difficulty for mvp - will add adaptive difficulty later on
        val difficulty = QuestionDifficulty.entries.random()
        val questions = questionRepository.findByDifficulty(difficulty)

        if (questions.isEmpty()) {
            error("No entries were extracted from db")
        }
        return questions.first()
    }

    @PostMapping("/submit")
    fun submitCode(@RequestBody request: CodeSubmissionRequest): SubmitResultResponse = judge0Service.submitCode(request)

    data class CodeSubmissionRequest(
        val code: String,
        val language: String,
        val input: String? = null,
        val questionId: Long
    )
}
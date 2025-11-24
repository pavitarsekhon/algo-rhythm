package com.example.algorhythm.api.controller

import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.service.Judge0Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.service.Judge0ResultResponse
import com.example.algorhythm.api.service.SubmitResultResponse
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody


@RestController
@RequestMapping("/api/questions")
class QuestionController (
    private val questionRepository: QuestionRepository,
    private val judge0Service: Judge0Service,
    private val userSessionRepository: UserSessionRepository
) {

    @GetMapping("/next")
    fun getNextQuestion(): Question? {
        val userSession = userSessionRepository.findByActiveIsTrue()
        val userCurrentQuestionId = userSession.currentQuestionId ?: error("TODO: Empty question id - give user question based on difficulty")
        // clear code window
        // random difficulty for mvp - will add adaptive difficulty later on
        val question = questionRepository.findById(userCurrentQuestionId)
            .orElseThrow { IllegalArgumentException("Question not found") }

        return question
    }

    @PostMapping("/submit")
    fun submitCode(@RequestBody request: CodeSubmissionRequest): SubmitResultResponse = judge0Service.submitCode(request)

    @PostMapping("/run")
    fun runCode(@RequestBody request: RunCodeRequest): Judge0ResultResponse = judge0Service.runCode(request.code, request.language, request.input)

    data class CodeSubmissionRequest(
        val code: String,
        val language: String,
        val input: String? = null,
        val questionId: Long
    )

    data class RunCodeRequest(
        val code: String,
        val language: String,
        val input: String? = null
    )
}
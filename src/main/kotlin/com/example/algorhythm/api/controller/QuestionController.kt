package com.example.algorhythm.api.controller

import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.service.*
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/api/questions")
class QuestionController (
    private val judge0Service: Judge0Service,
    private val userSessionRepository: UserSessionRepository,
    private val userRepository: UserRepository,
    private val questionGeneratorService: QuestionGeneratorService,
    private val difficultyEngineService: DifficultyEngineService
) {

    @GetMapping("/next")
    fun getNextQuestion(): Question? {
        val currentUser = getCurrentUser()
        val userSession = userSessionRepository.findByUserId(currentUser.id)
            ?: error("User session not found. Start a session first.")
        val user = userSession.user

        val newDifficulty = difficultyEngineService.adjustDifficulty(
            current = userSession.currentDifficulty,
            attempts = userSession.totalAttempts,
            lastCorrect = userSession.correctLastAnswer
        )

        userSession.currentDifficulty = newDifficulty
        userSessionRepository.save(userSession)

        val question = questionGeneratorService.generateQuestion(newDifficulty, user.experienceLevel ?: "beginner")
        userSession.currentQuestionId = question.id
        userSession.totalAttempts = 0
        userSession.correctLastAnswer = false
        userSessionRepository.save(userSession)
        return question
    }

    @PostMapping("/submit")
    fun submitCode(@RequestBody request: CodeSubmissionRequest): SubmitResultResponse {
        val currentUser = getCurrentUser()
        return judge0Service.submitCode(request, currentUser.id)
    }

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

    private fun getCurrentUser() =
        userRepository.findByUsername(
            SecurityContextHolder.getContext().authentication.name
        ).orElseThrow { IllegalArgumentException("User not found") }
}
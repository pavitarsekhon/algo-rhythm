package com.example.algorhythm.api.controller

import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.repository.QuestionRepository
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
    private val questionRepository: QuestionRepository,
    private val questionService: QuestionService,
    private val difficultyEngineService: DifficultyEngineService,
    private val userProgressService: UserProgressService,
    private val topicQuizService: TopicQuizService
) {

    /**
     * Get the user's current question without advancing to the next one.
     * If no current question exists, returns a new question.
     */
    @GetMapping("/current")
    fun getCurrentQuestion(): Question? {
        val currentUser = getCurrentUser()
        val userSession = userSessionRepository.findByUserId(currentUser.id)
            ?: error("User session not found. Start a session first.")

        val currentQuestionId = userSession.currentQuestionId
        if (currentQuestionId != null && currentQuestionId > 0) {
            val question = questionRepository.findById(currentQuestionId).orElse(null)
            if (question != null) {
                return question
            }
        }

        // No current question, get a new one
        return getNextQuestion()
    }

    @GetMapping("/next")
    fun getNextQuestion(): Question? {
        val currentUser = getCurrentUser()
        val userSession = userSessionRepository.findByUserId(currentUser.id)
            ?: error("User session not found. Start a session first.")
        val user = userSession.user
        val attemptsForCurrentQuestion = userSession.totalAttempts
        val solvedQuickly = attemptsForCurrentQuestion in 1..2

        val newDifficulty = difficultyEngineService.adjustDifficulty(
            current = userSession.currentDifficulty,
            attempts = attemptsForCurrentQuestion,
            previousFastSolve = userSession.correctLastAnswer
        )

        userSession.currentDifficulty = newDifficulty
        userSession.correctLastAnswer = solvedQuickly
        userSession.totalAttempts = 0
        userSessionRepository.save(userSession)

        val question = questionService.generateQuestion(newDifficulty, user.experienceLevel ?: "beginner")
        userSession.currentQuestionId = question.id
        userSession.totalAttempts = 0
        userSessionRepository.save(userSession)
        return question
    }

    @PostMapping("/submit")
    fun submitCode(@RequestBody request: CodeSubmissionRequest): SubmitResultResponse {
        val currentUser = getCurrentUser()
        val result = judge0Service.submitCode(request, currentUser.id)

        // If all tests passed, record the completion in user progress
        if (result.allPassed) {
            val question = questionRepository.findById(request.questionId).orElse(null)
            if (question != null) {
                userProgressService.recordCompletion(
                    user = currentUser,
                    difficulty = question.difficulty?.toString() ?: "Easy",
                    topics = question.topics
                )
            }
        }

        return result
    }

    @PostMapping("/run-tests")
    fun runTestCases(@RequestBody request: CodeSubmissionRequest): SubmitResultResponse {
        val currentUser = getCurrentUser()
        return judge0Service.runTestCases(request, currentUser.id)
    }

    @PostMapping("/run")
    fun runCode(@RequestBody request: RunCodeRequest): Judge0ResultResponse = judge0Service.runCode(request.code, request.language, request.input)

    @PostMapping("/topic-check")
    fun generateTopicCheck(@RequestBody request: TopicCheckRequest): List<TopicCheckQuestionResponse> {
        getCurrentUser() // require authenticated user
        val question = questionRepository.findById(request.questionId)
            .orElseThrow { IllegalArgumentException("Question not found") }

        return topicQuizService.generateTopicCheck(question, count = 5).map {
            TopicCheckQuestionResponse(
                id = it.id,
                statement = it.statement,
                isTrue = it.isTrue
            )
        }
    }

    data class CodeSubmissionRequest(
        val code: String,
        val language: String,
        val input: String? = null,
        val questionId: Long,
        val customTestCases: List<CustomTestCase>? = null
    )

    data class CustomTestCase(
        val input: String,
        val expectedOutput: String? = null
    )

    data class RunCodeRequest(
        val code: String,
        val language: String,
        val input: String? = null
    )

    data class TopicCheckRequest(
        val questionId: Long
    )

    data class TopicCheckQuestionResponse(
        val id: String,
        val statement: String,
        val isTrue: Boolean
    )

    private fun getCurrentUser() =
        userRepository.findByUsername(
            SecurityContextHolder.getContext().authentication.name
        ).orElseThrow { IllegalArgumentException("User not found") }
}
package com.example.algorhythm.api.controller

import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/chat")
class ChatController(
    private val userSessionRepository: UserSessionRepository,
    private val questionRepository: QuestionRepository
) {

    @PostMapping
    fun chat(@RequestBody request: ChatRequest): ChatResponse {
        val activeUser = userSessionRepository.findByActiveIsTrue()
        val currentQuestionId = activeUser.currentQuestionId ?: error("User has not attempted a question")
        val currentQuestion = questionRepository.findById(currentQuestionId)
            .orElseThrow { IllegalArgumentException("Question not found") }
        val message = request.message.lowercase().trim()
        val responseText = when {
            "hint" in message -> currentQuestion.hints
            "answer" in message -> "I can’t give the full solution - but you can ask for a hint."
            "solution" in message -> "I can’t give the full solution - but you can ask for a hint."
            "error" in message -> "Take a look at your error message carefully — it usually tells you which line went wrong."
            else -> return ChatResponse("NO INPUT PROVIDED")
        } ?: error("Response text not given")
        return ChatResponse(responseText)
    }
}

data class ChatRequest(
    val message: String
)

data class ChatResponse(
    val reply: String
)
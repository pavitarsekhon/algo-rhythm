package com.example.algorhythm.api.controller

import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.service.ChatService
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/chat")
class ChatController(
    private val userSessionRepository: UserSessionRepository,
    private val userRepository: UserRepository,
    private val chatService: ChatService
) {

    @PostMapping
    fun chat(@RequestBody request: ChatRequest): ChatResponse {
        val currentUser = getCurrentUser()
        val activeUser = userSessionRepository.findByUserId(currentUser.id)
            ?: error("User session not found. Start a session first.")
        val message = request.message.lowercase().trim()
        val reply = chatService.chat(
            userId = activeUser.user.id,
            userMessage =  message,
            userCode = request.code
        )
        return ChatResponse(reply)
    }

    private fun getCurrentUser() =
        userRepository.findByUsername(
            SecurityContextHolder.getContext().authentication.name
        ).orElseThrow { IllegalArgumentException("User not found") }
}

data class ChatRequest(
    val message: String,
    val code: String
)

data class ChatResponse(
    val reply: String
)
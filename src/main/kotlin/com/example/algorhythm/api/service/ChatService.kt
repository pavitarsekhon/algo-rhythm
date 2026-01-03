package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.ChatMessage
import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.repository.ChatMessageRepository
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.scheduler.Schedulers
import java.util.concurrent.Semaphore
import kotlin.concurrent.Volatile

@Service
class ChatService(
    private val userRepository: UserRepository,
    private val chatMessageRepository: ChatMessageRepository,
    private val userSessionRepository: UserSessionRepository,
    private val webClient: WebClient,
    private val questionRepository: QuestionRepository,
    private val geminiService: GeminiService,
    @Value("\${gemini.api.key}") private val apiKey: String,
    @Value("\${gemini.model}") private val model: String
) {

    private val geminiSemaphore = Semaphore(1)

    @Volatile
    private var lastRequestTime = 0L

    fun chat(userId: Long, userMessage: String, userCode: String?): String {

        geminiSemaphore.acquire()
        try {
            val now = System.currentTimeMillis()
            val elapsed = now - lastRequestTime
            if (elapsed < 15_000) {
                Thread.sleep(15_000 - elapsed)
            }
            lastRequestTime = System.currentTimeMillis()

            val user = userRepository.findById(userId).orElseThrow()
            val session = userSessionRepository.findByUserId(userId)
            val questionId = session?.currentQuestionId

            val questionText = try {
                questionRepository.findById(questionId!!).orElseThrow().prompt
            } catch (_: Exception) {
                "No question context available."
            }

            val historyText = chatMessageRepository
                .findTop5ByUserIdOrderByTimestamp(userId)
                .reversed()
                .joinToString("\n") { "${it.sender.uppercase()}: ${it.message}" }

            val safeCode = userCode?.take(2000) ?: "(no code provided)"

            val requestBody = geminiService.generateChatRequestBody(
                message = userMessage,
                user = user,
                chatHistory = historyText,
                questionText = questionText,
                code = safeCode
            )

            return webClient.post()
                .uri("https://generativelanguage.googleapis.com/v1/models/$model:generateContent?key=$apiKey")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map::class.java)
                .map { extractText(it) ?: "Sorry, I couldn't generate a response." }
                .publishOn(Schedulers.boundedElastic())
                .map { reply ->
                    chatMessageRepository.save(
                        ChatMessage(user = user, questionId = questionId, sender = "user", message = userMessage)
                    )
                    chatMessageRepository.save(
                        ChatMessage(user = user, questionId = questionId, sender = "bot", message = reply)
                    )
                    reply
                }
                .block()!!

        } finally {
            geminiSemaphore.release()
        }
    }

    private fun extractText(json: Map<*, *>): String? {
        val candidates = json["candidates"] as? List<*> ?: return null
        val first = candidates.firstOrNull() as? Map<*, *> ?: return null
        val content = first["content"] as? Map<*, *> ?: return null
        val parts = content["parts"] as? List<*> ?: return null
        val firstPart = parts.firstOrNull() as? Map<*, *> ?: return null
        return firstPart["text"] as? String
    }

}
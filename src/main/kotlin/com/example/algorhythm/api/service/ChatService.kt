package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.ChatMessage
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
    @Value("\${groq.api.key}") private val groqApiKey: String,
    @Value("\${groq.model}") private val groqModel: String
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

            val systemPrompt = """
                You are a helpful coding tutor assistant for a LeetCode-style platform.
                
                IMPORTANT RULES:
                - DO NOT provide complete solutions or full implementations
                - DO NOT give away the answer directly
                - Guide users with hints, questions, and conceptual explanations
                - Help debug specific issues in their code
                - Explain algorithmic concepts without revealing the exact solution
                - Ask clarifying questions to help users think through the problem
                - Suggest approaches or patterns without writing the complete code
                
                FORMATTING GUIDELINES:
                - Use **bold text** for key concepts, important terms, or section headings
                - Use `inline code` for variable names, function names, or short code snippets
                - Use bullet points (- or *) to list ideas, hints, or steps
                - Keep paragraphs short and focused
                - Use blank lines to separate different ideas or sections
                - For code examples, use triple backticks (```) for multi-line code blocks
                - Avoid heavy academic formatting (no "Theorem:", "Proof:", "Lemma:" etc.)
                - Keep language conversational and encouraging
                
                RESPONSE STRUCTURE (when appropriate):
                - Start with acknowledgment or a guiding question
                - Use **bold headings** to organize ideas (e.g., **Key Insight:**, **Hint:**, **Consider this:**)
                - List specific points as bullets
                - End with an encouraging next step or question
                
                If the user explicitly asks for the solution, politely decline and offer to help them work through it step by step instead.
            """.trimIndent()

            // Build the user message with context
            val userContent = buildString {
                append("Problem context:\n")
                append(questionText).append("\n\n")
                if (historyText.isNotBlank()) {
                    append("Previous conversation:\n")
                    append(historyText).append("\n\n")
                }
                if (userCode != null) {
                    append("User's current code:\n")
                    append(safeCode).append("\n\n")
                }
                append("User's message:\n")
                append(userMessage)
            }

            val messages = listOf(
                mapOf("role" to "system", "content" to systemPrompt),
                mapOf("role" to "user", "content" to userContent)
            )
            val requestBody = mapOf("model" to groqModel, "messages" to messages)

            return webClient.post()
                .uri("https://api.groq.com/openai/v1/chat/completions")
                .header("Authorization", "Bearer $groqApiKey")
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
        // Try OpenAI/Groq style: choices[0].message.content or choices[0].text
        val choices = json["choices"] as? List<*>
        if (!choices.isNullOrEmpty()) {
            val firstChoice = choices.firstOrNull() as? Map<*, *>
            val message = firstChoice?.get("message") as? Map<*, *>
            val content = message?.get("content") as? String
            if (!content.isNullOrBlank()) return content
            val text = firstChoice?.get("text") as? String
            if (!text.isNullOrBlank()) return text
        }

        // Fallback: Gemini style response parsing
        val candidates = json["candidates"] as? List<*>
        val first = candidates?.firstOrNull() as? Map<*, *> ?: return null
        val content = first["content"] as? Map<*, *> ?: return null
        val parts = content["parts"] as? List<*>
        val firstPart = parts?.firstOrNull() as? Map<*, *> ?: return null
        return firstPart["text"] as? String
    }

}
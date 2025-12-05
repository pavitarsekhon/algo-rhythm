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

@Service
class ChatService(
    private val userRepository: UserRepository,
    private val chatMessageRepository: ChatMessageRepository,
    private val userSessionRepository: UserSessionRepository,
    private val webClient: WebClient,
    private val questionRepository: QuestionRepository,
    @Value("\${gemini.api.key}") private val apiKey: String,
    @Value("\${gemini.model}") private val model: String
) {

    fun chat(userId: Long, userMessage: String, userCode: String?): String {
        val user = userRepository.findById(userId).orElseThrow()
        val session = userSessionRepository.findByUserId(userId)
        val questionId = session?.currentQuestionId
        val questionText = questionRepository.findById(questionId!!).orElseThrow {
            throw IllegalArgumentException("Question doesn't exist")
        }.prompt

        // Load last 20 messages for personalization
        val historyText = chatMessageRepository
            .findTop20ByUserIdOrderByTimestamp(userId)
            .reversed()
            .joinToString("\n") { "${it.sender.uppercase()}: ${it.message}" }

        val systemPrompt = """
            You are AlgoBot, an AI tutor for algorithmic problem solving.

            ### USER PROFILE ###
            Age: ${user.age}
            Experience: ${user.experienceLevel}
            Known Languages: ${user.knownLanguages}

            ### INSTRUCTIONS ###
            - Never provide full solutions or complete code.
            - Provide hints, point out mistakes, guide line-by-line.
            - If asked "what is wrong?", analyze user code carefully.
            - You may reference line numbers.
            - Match tone + difficulty to the user’s skill level.
            - Do not produce a large output that may be overwhelming to the user
            - Tailor the response towards the user's age and experience and known languages (if any)
            - Be concise but helpful.
            - if anything is asked that is not related to the question / code 
            
            
            ### QUESTION ###
            $questionText

            ### CHAT HISTORY ###
            $historyText

            ### NEW USER MESSAGE ###
            $userMessage

            ### USER CODE ###
            ${userCode ?: "(no code provided)"}
        """.trimIndent()

        val requestBody = mapOf(
            "contents" to listOf(
                mapOf(
                    "role" to "user",
                    "parts" to listOf(mapOf("text" to systemPrompt))
                )
            )
        )

        return webClient.post()
            .uri("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map::class.java)
            .map { response -> extractText(response) ?: "Sorry, I couldn't generate a response." }
            .publishOn(Schedulers.boundedElastic())
            .map { reply ->
                // Save both messages
                chatMessageRepository.save(ChatMessage(user = user, questionId = questionId, sender = "user", message = userMessage))
                chatMessageRepository.save(ChatMessage(user = user, questionId = questionId, sender = "bot", message = reply))
                reply
            }
            .block()!!
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
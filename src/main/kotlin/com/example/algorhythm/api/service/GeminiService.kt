package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.User
import org.springframework.stereotype.Service

@Service
class GeminiService {
    fun generateChatRequestBody(message: String, user: User, chatHistory: String, questionText: String, code: String): Map<String, List<Map<String, Any>>> {
        val prompt = chatPrompt.replace("USER_AGE", user.age.toString())
            .replace("USER_EXPERIENCE", user.experienceLevel ?:"Beginner")
            .replace("USER_LANGUAGES", user.knownLanguages ?: "")
            .replace("QUESTION_TEXT", questionText)
            .replace("CHAT_HISTORY", chatHistory)
            .replace("USER_MESSAGE", message)
            .replace("USER_CODE", code)

        val requestBody = mapOf(
            "contents" to listOf(
                mapOf(
                    "role" to "user",
                    "parts" to listOf(mapOf("text" to prompt))
                )
            )
        )
        return requestBody
    }

    companion object {
        private val chatPrompt = """
            You are AlgoBot, an AI tutor for algorithmic problem solving.

            ### USER PROFILE ###
            Age: USER_AGE
            Experience: USER_EXPERIENCE
            Known Languages: USER_LANGUAGES

            ### INSTRUCTIONS ###
            - Never provide full solutions or complete code.
            - Provide hints and guide line-by-line.
            - Be concise and match the user’s skill level.

            ### QUESTION ###
            QUESTION_TEXT

            ### CHAT HISTORY ###
            CHAT_HISTORY

            ### NEW USER MESSAGE ###
            USER_MESSAGE

            ### USER CODE ###
            USER_CODE
        """.trimIndent()
    }
}
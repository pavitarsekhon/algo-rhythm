package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.IOPair
import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.enum.ExecutionType
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class QuestionGeneratorService(
    private val webClient: WebClient,
    private val questionRepository: QuestionRepository,
    @Value("\${gemini.api.key}") private val apiKey: String,
    @Value("\${gemini.model}") private val model: String
) {

    private val mapper = jacksonObjectMapper()

    private val questionSchema = mapOf(
        "type" to "object",
        "required" to listOf(
            "topics",
            "prompt",
            "difficulty",
            "executionType",
            "ioPairs"
        ),
        "properties" to mapOf(
            "topics" to mapOf(
                "type" to "array",
                "items" to mapOf("type" to "string"),
                "minItems" to 1,
                "maxItems" to 5
            ),
            "prompt" to mapOf("type" to "string"),
            "difficulty" to mapOf("type" to "string"),
            "executionType" to mapOf(
                "type" to "string",
                "enum" to listOf("STDIN", "FUNCTION")
            ),
            "hints" to mapOf("type" to "string"),
            "ioPairs" to mapOf(
                "type" to "array",
                "minItems" to 2,
                "maxItems" to 4,
                "items" to mapOf(
                    "type" to "object",
                    "required" to listOf("inputText", "expectedOutput"),
                    "properties" to mapOf(
                        "inputText" to mapOf("type" to "string"),
                        "expectedOutput" to mapOf("type" to "string")
                    )
                )
            )
        )
    )

    fun generateQuestion(difficulty: QuestionDifficulty, userLevel: String): Question {

        val questions = questionRepository.findByDifficulty(difficulty)
        if (questions.isNotEmpty()) {
            return questions.random()
        }
        throw IllegalArgumentException("No questions available for difficulty: $difficulty")
    }

    private fun extractJson(response: Map<*, *>): String {
        val candidates = response["candidates"] as? List<*> ?: error("Missing candidates")
        val first = candidates.firstOrNull() as? Map<*, *> ?: error("Empty candidates")

        val content = first["content"] as? Map<*, *> ?: error("Missing content")
        val parts = content["parts"] as? List<*> ?: error("Missing parts")

        val text = (parts.firstOrNull() as? Map<*, *>)?.get("text") as? String
            ?: error("Missing text field from Gemini")

        return text.trim()
    }
}

data class GeneratedQuestionDTO(
    val topics: List<String>,
    val prompt: String,
    val difficulty: String,
    val executionType: String,
    val hints: String?,
    val ioPairs: List<IOPairDTO>
)

data class IOPairDTO(
    val inputText: String,
    val expectedOutput: String
)

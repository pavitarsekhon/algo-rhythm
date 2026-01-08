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

        val prompt = """
            Generate a programming challenge suitable for a coding practice platform.

            Requirements:
            - Difficulty: $difficulty
            - Fit the question to user level: $userLevel
            - Include 2–4 example IO pairs.
            - Prompt must clearly explain expected input & output.
            - NO explanations. NO markdown. Output ONLY valid JSON.
        """.trimIndent()

        val requestBody = mapOf(
            "contents" to listOf(
                mapOf(
                    "role" to "user",
                    "parts" to listOf(mapOf("text" to prompt))
                )
            ),
            "generationConfig" to mapOf(
                "responseMimeType" to "application/json",
                "responseSchema" to questionSchema
            )
        )

        val apiResponse = webClient.post()
            .uri("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block()
            ?: throw IllegalStateException("Empty response from Gemini")

        val rawJson = extractJson(apiResponse)

        println("RAW GEMINI JSON:\n$rawJson")

        val dto: GeneratedQuestionDTO = mapper.readValue(rawJson)

        val question = Question(
            topics = dto.topics.joinToString(", "),
            prompt = dto.prompt,
            difficulty = QuestionDifficulty.valueOf(dto.difficulty.uppercase()),
            executionType = ExecutionType.valueOf(dto.executionType.uppercase())
        )

        dto.ioPairs.forEach {
            question.ioPairs.add(IOPair(inputText = it.inputText, expectedOutput = it.expectedOutput, question = question))
        }

        return questionRepository.save(question)
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

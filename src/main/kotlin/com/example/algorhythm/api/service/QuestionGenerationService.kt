package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.IOPair
import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.enum.ExecutionType
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class QuestionGenerationService(
    private val webClient: WebClient,
    private val questionRepository: QuestionRepository,
    @Value("\${groq.api.key:}") private val groqApiKey: String,
    @Value("\${groq.model:llama-3.3-70b-versatile}") private val groqModel: String
) {
    private val logger = LoggerFactory.getLogger(QuestionGenerationService::class.java)
    private val mapper = jacksonObjectMapper()

    fun generateQuestions(count: Int = 5, difficulty: QuestionDifficulty = QuestionDifficulty.EASY): List<Question> {
        val prompt = buildGenerationPrompt(count, difficulty)

        val messages = listOf(
            mapOf("role" to "system", "content" to getSystemPrompt()),
            mapOf("role" to "user", "content" to prompt)
        )

        val requestBody = mapOf("model" to groqModel, "messages" to messages)

        val response = webClient.post()
            .uri("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", "Bearer $groqApiKey")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map::class.java)
            .block() ?: throw RuntimeException("Failed to get response from LLM")

        val content = extractContent(response)
        logger.info("LLM Response: $content")

        return parseAndSaveQuestions(content, difficulty)
    }

    private fun getSystemPrompt(): String = """
        You are a coding problem generator for a LeetCode-style platform.
        You must generate programming problems in a specific JSON format.
        Each problem should be unique, well-defined, and have clear test cases.
        Focus on common data structures and algorithms topics.
        
        IMPORTANT: Return ONLY valid JSON, no markdown, no explanations, just the JSON array.
    """.trimIndent()

    private fun buildGenerationPrompt(count: Int, difficulty: QuestionDifficulty): String = """
        Generate exactly $count unique coding problems at ${difficulty.name} difficulty level.
        
        Return a JSON array with this exact structure:
        [
            {
                "functionName": "isValid",
                "topics": "Stack|String",
                "prompt": "Problem description with examples and constraints...",
                "starterCode": "class Solution:\n    def functionName(self, param: type) -> returnType:\n        ",
                "ioPairs": [
                    {"input": "param = value", "expected": "expectedOutput"},
                    {"input": "param = value2", "expected": "expectedOutput2"}
                ]
            }
        ]
        
        CRITICAL JSON FORMATTING RULES:
        - All string values MUST be wrapped in double quotes: "value"
        - For empty strings, use: "expected": ""
        - For boolean results, use strings: "expected": "true" or "expected": "false"
        - For numeric results, use strings: "expected": "42"
        - For array results, use strings: "expected": "[1,2,3]"
        - NEVER use escaped quotes like \" outside of string content
        - NEVER use unquoted values
        
        Requirements:
        1. Each problem must have a unique functionName (camelCase)
        2. Topics should be pipe-separated (e.g., "Array|HashTable|TwoPointers")
        3. The prompt should include:
           - Clear problem description
           - 2-3 examples with Input/Output
           - Constraints
        4. starterCode should be Python with proper type hints
        5. Each problem needs 8-12 diverse test cases (ioPairs)
        6. Test cases should cover edge cases, normal cases, and boundary conditions
        7. ALL expected values must be strings (wrapped in double quotes)
        
        Common topics to choose from: Array, String, HashTable, Stack, Queue, LinkedList, Tree, Graph, DynamicProgramming, TwoPointers, BinarySearch, Sorting, Math, Recursion, Greedy
        
        For ${difficulty.name} difficulty:
        ${when(difficulty) {
            QuestionDifficulty.EASY -> "- Simple logic, single data structure, O(n) or O(n log n) solutions"
            QuestionDifficulty.MEDIUM -> "- Combine 2 concepts, moderate complexity, may need optimization"
            QuestionDifficulty.HARD -> "- Complex algorithms, multiple techniques, optimal solution requires insight"
        }}
        
        Return ONLY the JSON array, nothing else. Ensure the JSON is 100% valid.
    """.trimIndent()

    private fun extractContent(response: Map<*, *>): String {
        val choices = response["choices"] as? List<*>
        if (!choices.isNullOrEmpty()) {
            val firstChoice = choices.firstOrNull() as? Map<*, *>
            val message = firstChoice?.get("message") as? Map<*, *>
            return message?.get("content") as? String ?: throw RuntimeException("No content in response")
        }
        throw RuntimeException("Invalid response structure")
    }

    private fun parseAndSaveQuestions(jsonContent: String, difficulty: QuestionDifficulty): List<Question> {
        // Clean the JSON content (remove markdown code blocks if present)
        var cleanJson = jsonContent
            .replace("```json", "")
            .replace("```", "")
            .trim()

        // Fix common LLM JSON errors:
        // 1. Fix unquoted empty strings like: "expected": \"\" -> "expected": ""
        cleanJson = cleanJson.replace(Regex(""":\s*\\"\\"(,|\s*\})""")) { match ->
            ": \"\"${match.groupValues[1]}"
        }
        // 2. Fix escaped quotes outside of strings like: "expected": \"value\" -> "expected": "value"
        cleanJson = cleanJson.replace(Regex(""":\s*\\"([^"]*)\\"(,|\s*\})""")) { match ->
            ": \"${match.groupValues[1]}\"${match.groupValues[2]}"
        }
        // 3. Fix trailing commas in arrays
        cleanJson = cleanJson.replace(Regex(""",\s*\]"""), "]")
        // 4. Fix trailing commas in objects
        cleanJson = cleanJson.replace(Regex(""",\s*\}"""), "}")

        logger.debug("Cleaned JSON: $cleanJson")

        val generatedQuestions: List<GeneratedQuestion> = try {
            mapper.readValue(cleanJson)
        } catch (e: Exception) {
            logger.error("Failed to parse JSON: $cleanJson", e)
            throw RuntimeException("Failed to parse LLM response as JSON: ${e.message}")
        }

        val savedQuestions = mutableListOf<Question>()

        for (gen in generatedQuestions) {
            val question = Question(
                executionType = ExecutionType.FUNCTION,
                topics = gen.topics,
                difficulty = difficulty,
                prompt = gen.prompt,
                functionName = gen.functionName,
                starterCode = gen.starterCode
            )

            // Save question first to get ID
            val savedQuestion = questionRepository.save(question)

            // Create and add IO pairs
            gen.ioPairs.forEach { pair ->
                val ioPair = IOPair(
                    inputText = pair.input,
                    expectedOutput = pair.getExpectedAsString(),
                    question = savedQuestion
                )
                savedQuestion.ioPairs.add(ioPair)
            }

            // Save again with IO pairs
            val finalQuestion = questionRepository.save(savedQuestion)
            savedQuestions.add(finalQuestion)

            logger.info("Saved question: ${finalQuestion.functionName} with ${finalQuestion.ioPairs.size} test cases")
        }

        return savedQuestions
    }
}

data class GeneratedQuestion(
    val functionName: String,
    val topics: String,
    val prompt: String,
    val starterCode: String,
    val ioPairs: List<GeneratedIOPair>
)

data class GeneratedIOPair(
    val input: String,
    val expected: Any  // Can be String, Boolean, Int, List, etc.
) {
    fun getExpectedAsString(): String {
        return when (expected) {
            is String -> expected
            is Boolean -> expected.toString()
            is Number -> expected.toString()
            is List<*> -> expected.toString().replace(" ", "")
            else -> expected.toString()
        }
    }
}


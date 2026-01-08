package com.example.algorhythm.api.service

import com.example.algorhythm.api.enum.ExecutionType
import com.example.algorhythm.api.repository.IOPairRepository
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.controller.QuestionController.CodeSubmissionRequest
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.consts.SUPPORTED_LANGUAGES
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class Judge0Service(
    private val webClient: WebClient,
    private val questionRepository: QuestionRepository,
    private val ioPairRepository: IOPairRepository,
    private val userSessionService: UserSessionService,
    private val userSessionRepository: UserSessionRepository
) {
    fun runCode(code: String, language: String, input: String? = null): Judge0ResultResponse {
         val requestBody = mapOf(
            "source_code" to code,
            "language_id" to SUPPORTED_LANGUAGES[language],
            "stdin" to (input ?: "")
         )
         val response = try {
             webClient.post()
                 .uri(SUBMISSION_URL)
                 .bodyValue(requestBody)
                 .retrieve()
                 .bodyToMono(Judge0SubmissionResponse::class.java)
                 .block() ?: throw RuntimeException("No response from Judge0")
         } catch (_: Exception) {
             error("ERROR: Submission of code to Judge0 failed")
         }
         return getResult(response.token)
    }

    private fun getResult(token: String): Judge0ResultResponse {
        var delay = 50L
        while (true) {
            val result = webClient.get()
                .uri("$SUBMISSION_URL/$token")
                .retrieve()
                .bodyToMono(Judge0ResultResponse::class.java)
                .block() ?: throw RuntimeException("No result from Judge0")

            if (result.status.id >= 3) { // execution finished
                return result
            }

            Thread.sleep(delay)
            delay = (delay * 1.5).coerceAtMost(1000.0).toLong() // gradually increase delay up to 1s
        }
    }

    fun submitCode(request: CodeSubmissionRequest, userId: Long): SubmitResultResponse {
        val questionId = request.questionId
        val userSession = userSessionRepository.findByUserId(userId) ?: throw IllegalArgumentException("User does not have a session")
        val question = questionRepository.findById(questionId)
            .orElseThrow { IllegalArgumentException("Question not found") }

        val ioPairs = ioPairRepository.findByQuestionId(questionId)
        val results = mutableListOf<TestResult>()

        ioPairs.forEach { pair ->
            val result = when (question.executionType) {
                ExecutionType.FUNCTION -> {
                    val testCode = wrapFunctionCode(request.code, pair.inputText, request.language)
                    runCode(testCode, request.language, "")
                }
                ExecutionType.STDIN -> {
                    runCode(request.code, request.language, pair.inputText)
                }
            }

            val output = result.stdout?.trim() ?: ""
            val expected = pair.expectedOutput.trim()
            val correct = normalize(expected) == normalize(output)
            results.add(TestResult(pair.inputText, expected, output, correct))
        }

        val testsPassed = results.all { it.correct }
        if (testsPassed) {
            userSessionService.increaseDifficulty(userId)
        }

        userSession.totalAttempts += 1
        userSessionRepository.save(userSession)
        return SubmitResultResponse(testsPassed, results)

    }

    fun wrapFunctionCode(userCode: String, inputText: String, language: String): String {
        val functionName = extractFunctionName(userCode)
        val arguments = parseInputArguments(inputText)

        return when (language.lowercase()) {
            "python", "python3" -> buildPythonWrapper(userCode, functionName, arguments)
//            "java" -> buildJavaWrapper(userCode, functionName, arguments) -- maybe for future
//            "c", "cpp", "c++" -> buildCWrapper(userCode, functionName, arguments) -- maybe for future
            else -> buildPythonWrapper(userCode, functionName, arguments) // default to Python
        }
    }


    private fun parseInputArguments(inputText: String): List<String> {
        val arguments = mutableListOf<String>()

        var depth = 0
        var inString = false
        val currentValue = StringBuilder()
        var seenEquals = false

        for (char in inputText) {
            when {
                char == '"' && (currentValue.isEmpty() || currentValue.last() != '\\') -> inString = !inString
                !inString && char == '[' -> depth++
                !inString && char == ']' -> depth--
                !inString && char == '=' && depth == 0 -> {
                    seenEquals = true
                    currentValue.clear()
                    continue
                }
                !inString && char == ',' && depth == 0 -> {
                    if (seenEquals) {
                        arguments.add(currentValue.toString().trim())
                        currentValue.clear()
                        seenEquals = false
                    }
                    continue
                }
            }
            if (seenEquals) {
                currentValue.append(char)
            }
        }

        if (seenEquals && currentValue.isNotEmpty()) {
            arguments.add(currentValue.toString().trim())
        }

        return arguments
    }

    private fun buildPythonWrapper(userCode: String, functionName: String, arguments: List<String>): String {
        val argsStr = arguments.joinToString(", ")
        return buildString {
            appendLine(userCode.trimEnd())
            appendLine()
            appendLine("if __name__ == \"__main__\":")
            appendLine("    result = $functionName($argsStr)")
            appendLine("    print(result)")
        }
    }

    private fun extractFunctionName(code: String): String {
        // Try to match Python-style function definitions
        val pythonRegex = Regex("""def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(""")
        pythonRegex.find(code)?.let { return it.groupValues[1] }

        // Try to match Java/Kotlin/C-style function definitions
        val cStyleRegex = Regex("""(?:[a-zA-Z_][\w<>\[\]\s]*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(""")
        cStyleRegex.find(code)?.let { return it.groupValues[1] }

        throw IllegalArgumentException("Could not extract function name from code")
    }

    fun normalize(output: String?): String = output
            ?.trim()
            ?.replace("\r\n", "\n")
            ?.replace("\r", "")
            ?: ""
    companion object {
        private const val SUBMISSION_URL = "https://ce.judge0.com/submissions/"
        private const val PYTHON_ID = 109
        private const val JAVA_ID = 91
        private const val C_ID = 103
    }
}

data class Judge0SubmissionResponse(
    val token: String
)

data class Judge0ResultResponse(
    val status: StatusInfo,
    val stdout: String?,
    val stderr: String?,
    val compile_output: String?,
    val time: String?,
    val memory: Int?
)

data class StatusInfo(
    val id: Int,
    val description: String
)

data class TestResult(
    val input: String,
    val expected: String,
    val actual: String,
    val correct: Boolean
)

data class SubmitResultResponse(
    val allPassed: Boolean,
    val results: List<TestResult>,
    val error: String? = null
)

data class RunCodeResponse(
    val output: String?,
    val error: String? = null
)
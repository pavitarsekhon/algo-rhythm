package com.example.algorhythm.api.service

import com.example.algorhythm.api.repository.IOPairRepository
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.controller.QuestionController.CodeSubmissionRequest
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.consts.SUPPORTED_LANGUAGES
import com.example.algorhythm.util.IndentationUtil
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono

@Service
class Judge0Service(
    private val webClient: WebClient,
    private val ioPairRepository: IOPairRepository,
    private val userSessionService: UserSessionService
) {
    fun runCode(code: String, language: String, input: String? = null): Judge0ResultResponse {
         val normalizedCode = when (language.lowercase()) {
             "python", "python3" -> IndentationUtil.normalizeForPython(code)
             else -> code
         }

         val requestBody = mapOf(
            "source_code" to normalizedCode,
            "language_id" to SUPPORTED_LANGUAGES[language],
            "stdin" to (input ?: "")
         )
         val response = try {
             webClient.post()
                 .uri(SUBMISSION_URL)
                 .bodyValue(requestBody)
                 .retrieve()
                 .bodyToMono<Judge0SubmissionResponse>()
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
        // For submit, use ALL test cases (including hidden ones)
        userSessionService.incrementTotalAttempts(userId)
        val ioPairs = ioPairRepository.findByQuestionIdAndHidden(request.questionId, false ).take(5) // ISSUE HERE
        val testCases = ioPairs.map { RunnableTestCase(it.inputText, it.expectedOutput) }
        return runTests(testCases, request)
    }

    /**
     * Run code against only non-hidden (visible) test cases.
     * This is used for the "Run" button to let users test their code
     * before submitting against all test cases.
     */
    fun runTestCases(request: CodeSubmissionRequest, userId: Long): SubmitResultResponse {
        if (!request.customTestCases.isNullOrEmpty()) {
            val testCases = request.customTestCases.map {
                RunnableTestCase(
                    input = it.input,
                    expectedOutput = it.expectedOutput ?: ""
                )
            }
            return runTests(testCases, request)
        }

        val ioPairs = ioPairRepository.findByQuestionIdAndHidden(request.questionId, false).take(3)
        val testCases = ioPairs.map { RunnableTestCase(it.inputText, it.expectedOutput) }
        return runTests(testCases, request)
    }

    private fun runTests(testCases: List<RunnableTestCase>, request: CodeSubmissionRequest): SubmitResultResponse {
        val results = mutableListOf<TestResult>()

        testCases.forEach { testCase ->
            val testCode = wrapFunctionCode(request.code, testCase.input, request.language)
            val result = runCode(testCode, request.language, "")

            val output = result.stdout?.trim() ?: ""
            val stderr = result.stderr?.trim()
            val expected = testCase.expectedOutput.trim()

            // If expected is empty, we consider it correct (for custom test cases where user just wants output)
            val correct = if (expected.isEmpty()) {
                true
            } else {
                val normExpected = normalize(expected)
                val normOutput = normalize(output)
                if (normExpected == normOutput) {
                    true
                } else {
                    // Try loose match (ignoring all whitespace) to handle spacing differences like [1, 2] vs [1,2]
                    normExpected.replace("\\s".toRegex(), "") == normOutput.replace("\\s".toRegex(), "")
                }
            }

            results.add(TestResult(testCase.input, expected, output, stderr, correct))
        }

        val testsPassed = results.all { it.correct }
        return SubmitResultResponse(testsPassed, results)
    }

    fun wrapFunctionCode(userCode: String, inputText: String, language: String): String {
        val functionName = extractFunctionName(userCode)
        val arguments = parseInputArguments(inputText)

        return buildPythonWrapper(userCode, functionName, arguments)
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
        val normalizedCode = IndentationUtil.normalizeForPython(userCode.trimEnd())
        val argsStr = arguments.joinToString(", ")
        val callExpr = inferCallExpression(normalizedCode, functionName)

        return buildString {
            appendLine(normalizedCode)
            appendLine()
            appendLine("if __name__ == \"__main__\":")
            appendLine("    result = $callExpr($argsStr)")
            appendLine("    print(result)")
        }
    }

    private fun inferCallExpression(code: String, functionName: String): String {
        val classBlockRegex = Regex("""class\s+([A-Za-z_][A-Za-z0-9_]*)\s*[:\(].*?(?=(?m:^class\s)|\z)""", setOf(RegexOption.DOT_MATCHES_ALL, RegexOption.MULTILINE))
        for (m in classBlockRegex.findAll(code)) {
            val block = m.value
            val className = m.groupValues[1]
            val defRegex = Regex("""def\s+$functionName\s*\(""")
            if (defRegex.containsMatchIn(block)) {
                return "${className}().$functionName"
            }
        }
        return functionName
    }

    private fun extractFunctionName(code: String): String {
        val pythonRegex = Regex("""def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(""")
        pythonRegex.find(code)?.let { return it.groupValues[1] }

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

data class RunnableTestCase(
    val input: String,
    val expectedOutput: String
)

data class StatusInfo(
    val id: Int,
    val description: String
)

data class TestResult(
    val input: String,
    val expected: String,
    val actual: String,
    val stderr: String?,
    val correct: Boolean
)

data class SubmitResultResponse(
    val allPassed: Boolean,
    val results: List<TestResult>,
    val error: String? = null
)
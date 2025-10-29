package com.example.algorhythm.api.service

import com.example.algorhythm.api.controller.QuestionController
import com.example.algorhythm.api.enum.ExecutionType
import com.example.algorhythm.api.repository.IOPairRepository
import com.example.algorhythm.api.repository.QuestionRepository
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class Judge0Service(
    private val webClient: WebClient,
    private val questionRepository: QuestionRepository,
    private val ioPairRepository: IOPairRepository
) {

     private fun runCode(code: String, language: String, input: String? = null): Judge0ResultResponse {
        val requestBody = mapOf(
            "source_code" to code,
            "language_id" to PYTHON_ID,
            "stdin" to (input ?: "")
        )

        val response = webClient.post()
            .uri(SUBMISSION_URL)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Judge0SubmissionResponse::class.java)
            .block() ?: throw RuntimeException("No response from Judge0")

        val token = response.token
        return getResult(token)

    }

    private fun getResult(token: String): Judge0ResultResponse {
        return webClient.get()
            .uri("$SUBMISSION_URL/$token")
            .retrieve()
            .bodyToMono(Judge0ResultResponse::class.java)
            .block() ?: throw RuntimeException("No result from Judge0")
    }

    fun submitCode(request: QuestionController.CodeSubmissionRequest): SubmitResultResponse {
        val questionId = request.questionId
        val question = questionRepository.findById(questionId)
            .orElseThrow { IllegalArgumentException("Question not found") }

        val ioPairs = ioPairRepository.findByQuestionId(questionId)
        val results = mutableListOf<TestResult>()

        ioPairs.forEach { pair ->
            val testCode = when (question.executionType) {
                ExecutionType.FUNCTION -> wrapFunctionCode(request.code, pair.inputText)
                ExecutionType.STDIN -> request.code
            }

            val stdinValue = when (question.executionType) {
                ExecutionType.FUNCTION -> ""
                ExecutionType.STDIN -> pair.inputText
            }

            val result = runCode(testCode, request.language, stdinValue)
            val output = result.stdout?.trim() ?: ""
            val expected = pair.expectedOutput.trim()
            val correct = normalize(expected) == normalize(output)

            results.add(TestResult(pair.inputText, expected, output, correct))
        }

        return SubmitResultResponse(results.all { it.correct }, results)

    }

    fun wrapFunctionCode(userCode: String, input: String): String {
        val functionName = extractFunctionName(userCode)
        return buildString {
            appendLine(userCode.trimEnd())
            appendLine()
            appendLine("if __name__ == '__main__':")
            appendLine("    print($functionName($input))")
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
    val results: List<TestResult>
)
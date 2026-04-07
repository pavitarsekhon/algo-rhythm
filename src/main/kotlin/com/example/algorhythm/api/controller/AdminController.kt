package com.example.algorhythm.api.controller
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.service.AdminService
import com.example.algorhythm.api.service.AdminStatsDTO
import com.example.algorhythm.api.service.QuestionGenerationService
import com.example.algorhythm.api.service.UserDTO
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val adminService: AdminService,
    private val questionGenerationService: QuestionGenerationService
) {
    private val logger = LoggerFactory.getLogger(AdminController::class.java)

    /**
     * Check if the current user is an admin
     */
    @GetMapping("/check")
    fun checkAdminStatus(): ResponseEntity<AdminCheckResponse> {
        val username = SecurityContextHolder.getContext().authentication?.name
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val isAdmin = adminService.isAdmin(username)
        return ResponseEntity.ok(AdminCheckResponse(isAdmin))
    }

    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/stats")
    fun getStats(): ResponseEntity<AdminStatsDTO> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return ResponseEntity.ok(adminService.getStats())
    }

    /**
     * Get all users
     */
    @GetMapping("/users")
    fun getAllUsers(): ResponseEntity<List<UserDTO>> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return ResponseEntity.ok(adminService.getAllUsers())
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{userId}")
    fun getUserById(@PathVariable userId: Long): ResponseEntity<UserDTO> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        val user = adminService.getUserById(userId)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(user)
    }

    /**
     * Update user admin status
     */
    @PutMapping("/users/{userId}/admin")
    fun setAdminStatus(
        @PathVariable userId: Long,
        @RequestBody request: SetAdminRequest
    ): ResponseEntity<UserDTO> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        val user = adminService.setAdminStatus(userId, request.isAdmin)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(user)
    }

    /**
     * Delete a user
     */
    @DeleteMapping("/users/{userId}")
    fun deleteUser(@PathVariable userId: Long): ResponseEntity<Void> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return if (adminService.deleteUser(userId)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Generate new questions using AI
     */
    @PostMapping("/questions/generate")
    fun generateQuestions(@RequestBody request: GenerateQuestionsRequest): ResponseEntity<GenerateQuestionsResponse> {
        logger.info("Generate questions request received: count=${request.count}, difficulty=${request.difficulty}")

        val isAdmin = isCurrentUserAdmin()
        logger.info("isCurrentUserAdmin() returned: $isAdmin")

        if (!isAdmin) {
            logger.warn("Returning 403 FORBIDDEN - user is not admin")
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        return try {
            val difficulty = try {
                QuestionDifficulty.valueOf(request.difficulty.uppercase())
            } catch (e: Exception) {
                QuestionDifficulty.EASY
            }

            logger.info("Starting question generation with difficulty: $difficulty")
            val questions = questionGenerationService.generateQuestions(
                count = request.count.coerceIn(1, 10),
                difficulty = difficulty
            )

            ResponseEntity.ok(GenerateQuestionsResponse(
                success = true,
                message = "Successfully generated ${questions.size} questions",
                questions = questions.map { q ->
                    GeneratedQuestionDTO(
                        id = q.id,
                        functionName = q.functionName,
                        topics = q.topics,
                        difficulty = q.difficulty.name,
                        testCaseCount = q.ioPairs.size,
                        prompt = q.prompt,
                        starterCode = q.starterCode,
                        testCases = q.ioPairs.map { io ->
                            TestCaseDTO(
                                input = io.inputText,
                                expectedOutput = io.expectedOutput
                            )
                        }
                    )
                }
            ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                GenerateQuestionsResponse(
                    success = false,
                    message = "Failed to generate questions: ${e.message}",
                    questions = emptyList()
                )
            )
        }
    }

    private fun isCurrentUserAdmin(): Boolean {
        val auth = SecurityContextHolder.getContext().authentication
        logger.info("Auth object: $auth, principal: ${auth?.principal}, type: ${auth?.principal?.javaClass}")
        val username = auth?.name
        if (username == null) {
            logger.warn("Username is null from security context")
            return false
        }
        val isAdmin = adminService.isAdmin(username)
        logger.info("User '$username' isAdmin: $isAdmin")
        return isAdmin
    }
}

data class AdminCheckResponse(val isAdmin: Boolean)
data class SetAdminRequest(val isAdmin: Boolean)
data class GenerateQuestionsRequest(
    val count: Int = 5,
    val difficulty: String = "EASY"
)
data class GenerateQuestionsResponse(
    val success: Boolean,
    val message: String,
    val questions: List<GeneratedQuestionDTO>
)
data class TestCaseDTO(
    val input: String,
    val expectedOutput: String
)
data class GeneratedQuestionDTO(
    val id: Long,
    val functionName: String?,
    val topics: String,
    val difficulty: String,
    val testCaseCount: Int,
    val prompt: String,
    val starterCode: String?,
    val testCases: List<TestCaseDTO>
)


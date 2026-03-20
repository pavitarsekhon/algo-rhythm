package com.example.algorhythm.api.controller

import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.repository.UserProgressRepository
import com.example.algorhythm.api.service.UserProgressService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userRepository: UserRepository,
    private val userSessionRepository: UserSessionRepository,
    private val userProgressRepository: UserProgressRepository,
    private val userProgressService: UserProgressService
) {

    @GetMapping("/profile")
    fun getProfile(): ResponseEntity<UserProfileResponse> {
        val username = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: return ResponseEntity.status(401).build()

        val user = userRepository.findByUsername(username).orElse(null)
            ?: return ResponseEntity.status(404).build()

        val session = userSessionRepository.findByUserId(user.id)
        val progress = userProgressRepository.findByUserId(user.id)

        return ResponseEntity.ok(
            UserProfileResponse(
                username = user.username,
                age = user.age,
                experienceLevel = user.experienceLevel,
                knownLanguages = user.knownLanguages,
                isAdmin = user.isAdmin,
                totalCorrect = session?.totalCorrect ?: 0,
                totalAttempts = session?.totalAttempts ?: 0,
                currentDifficulty = session?.currentDifficulty?.toString() ?: "Easy",
                successRate = if ((session?.totalAttempts ?: 0) > 0) {
                    ((session?.totalCorrect ?: 0).toDouble() / session!!.totalAttempts * 100).toInt()
                } else 0,
                progress = progress?.let {
                    UserProgressDTO(
                        // Difficulty counts
                        easyCompleted = it.easyCompleted,
                        mediumCompleted = it.mediumCompleted,
                        hardCompleted = it.hardCompleted,
                        // Topic counts
                        topicCounts = mapOf(
                            "Array" to it.arrayCompleted,
                            "Backtracking" to it.backtrackingCompleted,
                            "Binary Search" to it.binarySearchCompleted,
                            "Binary Search Tree" to it.binarySearchTreeCompleted,
                            "Binary Tree" to it.binaryTreeCompleted,
                            "Bit Manipulation" to it.bitManipulationCompleted,
                            "Combinatorics" to it.combinatoricsCompleted,
                            "Depth-First Search" to it.depthFirstSearchCompleted,
                            "Divide and Conquer" to it.divideAndConquerCompleted,
                            "Dynamic Programming" to it.dynamicProgrammingCompleted,
                            "Greedy" to it.greedyCompleted,
                            "Hash Table" to it.hashTableCompleted,
                            "Math" to it.mathCompleted,
                            "Matrix" to it.matrixCompleted,
                            "Memoization" to it.memoizationCompleted,
                            "Monotonic Stack" to it.monotonicStackCompleted,
                            "Recursion" to it.recursionCompleted,
                            "Simulation" to it.simulationCompleted,
                            "Sliding Window" to it.slidingWindowCompleted,
                            "Sorting" to it.sortingCompleted,
                            "Stack" to it.stackCompleted,
                            "String" to it.stringCompleted,
                            "String Matching" to it.stringMatchingCompleted,
                            "Tree" to it.treeCompleted,
                            "Trie" to it.trieCompleted,
                            "Two Pointers" to it.twoPointersCompleted
                        ),
                        topicProgress = userProgressService.getTopicProgressMap(it)
                    )
                }
            )
        )
    }
}

data class UserProgressDTO(
    val easyCompleted: Int,
    val mediumCompleted: Int,
    val hardCompleted: Int,
    val topicCounts: Map<String, Int>,
    val topicProgress: Map<String, Int>
)

data class UserProfileResponse(
    val username: String,
    val age: Int?,
    val experienceLevel: String?,
    val knownLanguages: String?,
    val isAdmin: Boolean,
    val totalCorrect: Int,
    val totalAttempts: Int,
    val currentDifficulty: String,
    val successRate: Int,
    val progress: UserProgressDTO?
)


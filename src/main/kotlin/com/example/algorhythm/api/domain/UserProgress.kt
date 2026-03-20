package com.example.algorhythm.api.domain

import jakarta.persistence.*

@Entity
@Table(name = "user_progress")
class UserProgress(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,

    // Difficulty counts
    var easyCompleted: Int = 0,
    var mediumCompleted: Int = 0,
    var hardCompleted: Int = 0,

    // Topic counts
    var arrayCompleted: Int = 0,
    var backtrackingCompleted: Int = 0,
    var binarySearchCompleted: Int = 0,
    var binarySearchTreeCompleted: Int = 0,
    var binaryTreeCompleted: Int = 0,
    var bitManipulationCompleted: Int = 0,
    var combinatoricsCompleted: Int = 0,
    var depthFirstSearchCompleted: Int = 0,
    var divideAndConquerCompleted: Int = 0,
    var dynamicProgrammingCompleted: Int = 0,
    var greedyCompleted: Int = 0,
    var hashTableCompleted: Int = 0,
    var mathCompleted: Int = 0,
    var matrixCompleted: Int = 0,
    var memoizationCompleted: Int = 0,
    var monotonicStackCompleted: Int = 0,
    var recursionCompleted: Int = 0,
    var simulationCompleted: Int = 0,
    var slidingWindowCompleted: Int = 0,
    var sortingCompleted: Int = 0,
    var stackCompleted: Int = 0,
    var stringCompleted: Int = 0,
    var stringMatchingCompleted: Int = 0,
    var treeCompleted: Int = 0,
    var trieCompleted: Int = 0,
    var twoPointersCompleted: Int = 0,

    @Column(name = "topic_progress_json", columnDefinition = "TEXT", nullable = false)
    var topicProgressJson: String = "{}"
) {
    // Helper method to increment topic count by topic name
    fun incrementTopicCount(topic: String) {
        when (topic.lowercase().replace(" ", "").replace("-", "")) {
            "array" -> arrayCompleted++
            "backtracking" -> backtrackingCompleted++
            "binarysearch" -> binarySearchCompleted++
            "binarysearchtree" -> binarySearchTreeCompleted++
            "binarytree" -> binaryTreeCompleted++
            "bitmanipulation" -> bitManipulationCompleted++
            "combinatorics" -> combinatoricsCompleted++
            "depthfirstsearch", "dfs" -> depthFirstSearchCompleted++
            "divideandconquer" -> divideAndConquerCompleted++
            "dynamicprogramming", "dp" -> dynamicProgrammingCompleted++
            "greedy" -> greedyCompleted++
            "hashtable" -> hashTableCompleted++
            "math" -> mathCompleted++
            "matrix" -> matrixCompleted++
            "memoization" -> memoizationCompleted++
            "monotonicstack" -> monotonicStackCompleted++
            "recursion" -> recursionCompleted++
            "simulation" -> simulationCompleted++
            "slidingwindow" -> slidingWindowCompleted++
            "sorting" -> sortingCompleted++
            "stack" -> stackCompleted++
            "string" -> stringCompleted++
            "stringmatching" -> stringMatchingCompleted++
            "tree" -> treeCompleted++
            "trie" -> trieCompleted++
            "twopointers" -> twoPointersCompleted++
        }
    }

    // Helper method to increment difficulty count
    fun incrementDifficultyCount(difficulty: String) {
        when (difficulty.lowercase()) {
            "easy" -> easyCompleted++
            "medium" -> mediumCompleted++
            "hard" -> hardCompleted++
        }
    }
}


package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.Question
import org.springframework.stereotype.Service

@Service
class TopicQuizService {

    fun generateTopicCheck(question: Question, count: Int = 5): List<TopicCheckItem> {
        require(count > 0) { "count must be positive" }

        val statements = getStatementsForQuestion(question).take(count)
        return statements.mapIndexed { index, item ->
            TopicCheckItem(
                id = "tf-${question.id}-${index + 1}",
                statement = item.statement.trim(),
                isTrue = item.isTrue
            )
        }
    }

    private fun getStatementsForQuestion(question: Question): List<RawTopicCheckItem> {
        val topicTokens = question.topics
            .split("|")
            .map { normalizeTopic(it) }
            .filter { it.isNotBlank() }

        val matchedTopic = topicTokens.firstOrNull { HARD_TOPIC_CHECKS.containsKey(it) }
        return HARD_TOPIC_CHECKS[matchedTopic] ?: HARD_TOPIC_CHECKS.getValue("array")
    }

    fun normalizeTopic(topic: String): String {
        val normalized = topic.lowercase().replace(Regex("[^a-z0-9]+"), " ").trim()
        return TOPIC_ALIASES[normalized] ?: normalized
    }

    fun evaluateTopicCheck(
        question: Question,
        answers: List<TopicCheckAnswer>,
        count: Int = 5,
        requiredScore: Int = 60
    ): TopicCheckEvaluation {
        val generated = generateTopicCheck(question, count)
        val answerMap = answers.associate { it.id to it.answer }

        val answeredCount = generated.count { answerMap.containsKey(it.id) }
        val correctCount = generated.count { item -> answerMap[item.id] == item.isTrue }
        val totalCount = generated.size
        val score = if (totalCount == 0) 0 else (correctCount * 100) / totalCount
        val allAnswered = answeredCount == totalCount
        val passed = allAnswered && score >= requiredScore

        val topicLabel = question.topics.split("|").firstOrNull()?.trim().orEmpty()
        val topicKey = normalizeTopic(topicLabel)

        return TopicCheckEvaluation(
            topic = topicLabel,
            topicKey = topicKey,
            score = score,
            correctCount = correctCount,
            totalCount = totalCount,
            allAnswered = allAnswered,
            requiredScore = requiredScore,
            passed = passed
        )
    }
}

data class TopicCheckItem(
    val id: String,
    val statement: String,
    val isTrue: Boolean
)

data class RawTopicCheckItem(
    val statement: String,
    val isTrue: Boolean
)

data class TopicCheckAnswer(
    val id: String,
    val answer: Boolean
)

data class TopicCheckEvaluation(
    val topic: String,
    val topicKey: String,
    val score: Int,
    val correctCount: Int,
    val totalCount: Int,
    val allAnswered: Boolean,
    val requiredScore: Int,
    val passed: Boolean
)

private val TOPIC_ALIASES = mapOf(
    "arrays" to "array",
    "hash table" to "hash table",
    "hashtable" to "hash table",
    "hashmap" to "hash table",
    "maps" to "hash table",
    "slidingwindow" to "sliding window",
    "two pointers" to "two pointers",
    "two pointer" to "two pointers",
    "divide and conquer" to "divide and conquer",
    "bit manipulation" to "bit manipulation",
    "binary search" to "binary search",
    "dynamic programming" to "dynamic programming",
    "combinatorics" to "combinatories",
    "combinatory" to "combinatories",
    "dfs" to "depth first search",
    "depth first traversal" to "depth first search"
)

private val HARD_TOPIC_CHECKS = mapOf(
    "array" to listOf(
        RawTopicCheckItem("Random index access in an array is typically O(1).", true),
        RawTopicCheckItem("Inserting at the front of a dynamic array is always O(1).", false),
        RawTopicCheckItem("Off-by-one errors are common when iterating array bounds.", true),
        RawTopicCheckItem("Sorting an array guarantees O(1) lookup for any value.", false),
        RawTopicCheckItem("Prefix sums can reduce repeated range-sum queries to O(1).", true)
    ),
    "hash table" to listOf(
        RawTopicCheckItem("Hash collisions can occur even with a strong hash function.", true),
        RawTopicCheckItem("A hash table always keeps keys in sorted order.", false),
        RawTopicCheckItem("Average-case insert and lookup are often O(1).", true),
        RawTopicCheckItem("Two unequal keys can never share the same bucket index.", false),
        RawTopicCheckItem("Choosing a poor hash function can degrade performance badly.", true)
    ),
    "string" to listOf(
        RawTopicCheckItem("String comparison bugs often come from whitespace and casing.", true),
        RawTopicCheckItem("Checking if one string is a substring is always O(1).", false),
        RawTopicCheckItem("Immutable strings can make repeated concatenation expensive.", true),
        RawTopicCheckItem("Every language stores strings as null-terminated C arrays.", false),
        RawTopicCheckItem("Two-pointer scans are useful for palindrome string checks.", true)
    ),
    "sliding window" to listOf(
        RawTopicCheckItem("Sliding window is best suited for contiguous regions.", true),
        RawTopicCheckItem("Window problems always require exactly fixed window size.", false),
        RawTopicCheckItem("A shrinking left pointer can restore invalid window constraints.", true),
        RawTopicCheckItem("Sliding window cannot be used on strings.", false),
        RawTopicCheckItem("Maintaining frequency counts helps with anagram-type windows.", true)
    ),
    "divide and conquer" to listOf(
        RawTopicCheckItem("Divide and conquer solves subproblems and combines results.", true),
        RawTopicCheckItem("Every divide-and-conquer algorithm runs in linear time.", false),
        RawTopicCheckItem("Merge sort is a divide-and-conquer algorithm.", true),
        RawTopicCheckItem("Binary search is unrelated to divide and conquer.", false),
        RawTopicCheckItem("Recurrence relations often model divide-and-conquer runtime.", true)
    ),
    "math" to listOf(
        RawTopicCheckItem("Using modulo arithmetic can prevent overflow in some tasks.", true),
        RawTopicCheckItem("Prime checking by testing up to n is always optimal.", false),
        RawTopicCheckItem("Greatest common divisor can be found efficiently via Euclid.", true),
        RawTopicCheckItem("Floating-point math is always exact for decimal values.", false),
        RawTopicCheckItem("Parity checks can often be done with bit operations.", true)
    ),
    "recursion" to listOf(
        RawTopicCheckItem("Every recursive algorithm needs a valid base case.", true),
        RawTopicCheckItem("Recursion can never be replaced by iteration.", false),
        RawTopicCheckItem("Deep recursion may overflow the call stack.", true),
        RawTopicCheckItem("A recursive step should move toward termination.", true),
        RawTopicCheckItem("Tail recursion is guaranteed to be optimized in all languages.", false)
    ),
    "greedy" to listOf(
        RawTopicCheckItem("Greedy methods choose the best local option each step.", true),
        RawTopicCheckItem("If greedy works for one optimization problem, it works for all.", false),
        RawTopicCheckItem("Greedy correctness is often proven with exchange arguments.", true),
        RawTopicCheckItem("Greedy algorithms always produce globally optimal answers.", false),
        RawTopicCheckItem("Sorting by a key is common before greedy selection.", true)
    ),
    "two pointers" to listOf(
        RawTopicCheckItem("Two pointers can reduce some O(n^2) scans to O(n).", true),
        RawTopicCheckItem("Two pointers only work on sorted arrays.", false),
        RawTopicCheckItem("Fast/slow pointers can detect linked-list cycles.", true),
        RawTopicCheckItem("Two-pointer methods cannot be used on strings.", false),
        RawTopicCheckItem("Pointer movement rules must preserve correctness invariants.", true)
    ),
    "trie" to listOf(
        RawTopicCheckItem("A trie supports efficient prefix lookups.", true),
        RawTopicCheckItem("Trie nodes must always store exactly 26 children.", false),
        RawTopicCheckItem("Trie memory usage can be high for sparse alphabets.", true),
        RawTopicCheckItem("A trie is unsuitable for autocomplete tasks.", false),
        RawTopicCheckItem("End-of-word markers distinguish full words from prefixes.", true)
    ),
    "bit manipulation" to listOf(
        RawTopicCheckItem("x & (x - 1) clears the lowest set bit in x.", true),
        RawTopicCheckItem("Left shift by one always divides by two.", false),
        RawTopicCheckItem("Bit masks are useful for subset/state representation.", true),
        RawTopicCheckItem("XOR of a number with itself is 1.", false),
        RawTopicCheckItem("Checking odd/even can be done using the least-significant bit.", true)
    ),
    "stack" to listOf(
        RawTopicCheckItem("A stack follows LIFO order.", true),
        RawTopicCheckItem("Breadth-first search is naturally implemented with a stack.", false),
        RawTopicCheckItem("Monotonic stacks help solve next greater element problems.", true),
        RawTopicCheckItem("Popping from an empty stack is always safe without checks.", false),
        RawTopicCheckItem("Balanced-parentheses validation is a classic stack use case.", true)
    ),
    "queue" to listOf(
        RawTopicCheckItem("A queue follows FIFO order.", true),
        RawTopicCheckItem("Queue dequeue removes the most recently inserted element.", false),
        RawTopicCheckItem("BFS uses a queue to process nodes level by level.", true),
        RawTopicCheckItem("Circular queues can reduce wasted array space.", true),
        RawTopicCheckItem("Queues cannot be implemented using two stacks.", false)
    ),
    "binary search" to listOf(
        RawTopicCheckItem("Binary search requires a monotonic condition or sorted order.", true),
        RawTopicCheckItem("Binary search checks every element in the worst case.", false),
        RawTopicCheckItem("Overflow-safe mid calculation avoids integer overflow bugs.", true),
        RawTopicCheckItem("Binary search is only valid on integer arrays.", false),
        RawTopicCheckItem("Lower-bound and upper-bound variants are common in practice.", true)
    ),
    "backtracking" to listOf(
        RawTopicCheckItem("Backtracking builds candidates and undoes invalid choices.", true),
        RawTopicCheckItem("Backtracking guarantees polynomial-time complexity.", false),
        RawTopicCheckItem("Pruning can dramatically reduce backtracking search space.", true),
        RawTopicCheckItem("Backtracking never uses recursion.", false),
        RawTopicCheckItem("Constraint checks should happen as early as possible.", true)
    ),
    "matrix" to listOf(
        RawTopicCheckItem("Matrix traversal often needs row and column boundary checks.", true),
        RawTopicCheckItem("All matrix problems can be solved without extra memory.", false),
        RawTopicCheckItem("Direction vectors simplify grid neighbor exploration.", true),
        RawTopicCheckItem("In a rectangular matrix, all rows always have equal length.", true),
        RawTopicCheckItem("Diagonal traversal can ignore index bounds.", false)
    ),
    "dynamic programming" to listOf(
        RawTopicCheckItem("DP is useful with overlapping subproblems and optimal substructure.", true),
        RawTopicCheckItem("Memoization and tabulation are unrelated to DP.", false),
        RawTopicCheckItem("A clear state definition is central to DP correctness.", true),
        RawTopicCheckItem("DP always uses recursion and cannot be iterative.", false),
        RawTopicCheckItem("Transition formulas connect current state to smaller states.", true)
    ),
    "combinatories" to listOf(
        RawTopicCheckItem("nCr counts selections where order does not matter.", true),
        RawTopicCheckItem("Permutations and combinations count identical outcomes.", false),
        RawTopicCheckItem("Pascal's identity can be used to compute combinations.", true),
        RawTopicCheckItem("Factorials grow very quickly with n.", true),
        RawTopicCheckItem("nPr is always smaller than nCr for the same n and r.", false)
    ),
    "memoization" to listOf(
        RawTopicCheckItem("Memoization caches function outputs for repeated inputs.", true),
        RawTopicCheckItem("Memoization only works for iterative algorithms.", false),
        RawTopicCheckItem("Memoization often turns exponential recursion into polynomial time.", true),
        RawTopicCheckItem("Memoization never increases memory usage.", false),
        RawTopicCheckItem("A cache key must uniquely represent the subproblem state.", true)
    ),
    "depth first search" to listOf(
        RawTopicCheckItem("DFS explores one path deeply before backtracking.", true),
        RawTopicCheckItem("DFS always gives shortest path in unweighted graphs.", false),
        RawTopicCheckItem("Visited tracking prevents infinite loops in cyclic graphs.", true),
        RawTopicCheckItem("DFS can be implemented with recursion or an explicit stack.", true),
        RawTopicCheckItem("DFS cannot be used for connected-component counting.", false)
    )
)



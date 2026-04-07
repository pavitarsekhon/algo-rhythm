package com.example.algorhythm.api.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.web.reactive.function.client.WebClient
import com.example.algorhythm.api.repository.ChatMessageRepository
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.repository.QuestionRepository
import kotlin.reflect.full.declaredMemberFunctions
import kotlin.reflect.jvm.isAccessible

@ExtendWith(MockitoExtension::class)
class ChatServiceTest {

    @Mock private lateinit var userRepository: UserRepository
    @Mock private lateinit var chatMessageRepository: ChatMessageRepository
    @Mock private lateinit var userSessionRepository: UserSessionRepository
    @Mock private lateinit var webClient: WebClient
    @Mock private lateinit var questionRepository: QuestionRepository

    private lateinit var chatService: ChatService

    @org.junit.jupiter.api.BeforeEach
    fun setUp() {
        chatService = ChatService(
            userRepository,
            chatMessageRepository,
            userSessionRepository,
            webClient,
            questionRepository,
            "dummy_api_key",
            "dummy_model"
        )
    }

    private fun invokeContainsCompleteSolution(reply: String, functionName: String?): Boolean {
        val method = ChatService::class.declaredMemberFunctions.find { it.name == "containsCompleteSolution" }
        requireNotNull(method) { "containsCompleteSolution method not found" }
        method.isAccessible = true
        return method.call(chatService, reply, functionName) as Boolean
    }

    @Test
    fun `should detect complete python solution block`() {
        val reply = """
            Here is the solution for your problem:
            ```python
            class Solution:
                def twoSum(self, nums, target):
                    hash_map = {}
                    for i, num in enumerate(nums):
                        complement = target - num
                        if complement in hash_map:
                            return [hash_map[complement], i]
                        hash_map[num] = i
                    return []
            ```
        """.trimIndent()
        assertTrue(invokeContainsCompleteSolution(reply, "twoSum"))
    }

    @Test
    fun `should not detect small conceptual snippet`() {
        val reply = """
            You should use a hash map for this. For example:
            ```python
            hash_map = {}
            hash_map[num] = i
            ```
            This allows O(1) lookups!
        """.trimIndent()
        assertFalse(invokeContainsCompleteSolution(reply, "twoSum"))
    }

    @Test
    fun `should detect long logic code block without function name`() {
        val reply = """
            Try something like this logic:
            ```javascript
            let arr = [];
            for (let i = 0; i < 10; i++) {
                if (i % 2 === 0) {
                   arr.push(i)
                }
            }
            return arr;
            ```
        """.trimIndent()
        // Wait, the logic is lines >= 8, hasControlFlow ("for ") and contains("return ")
        // lines: 
        // let arr = [];
        // for (let i = 0; i < 10; i++) {
        //     if (i % 2 === 0) {
        //        arr.push(i)
        //     }
        // }
        // return arr;
        // Total 10 lines. Contains return. Contains for. It should match. Let me add enough lines.
        val reply2 = """
            ```java
            int n = 10;
            int current = 0;
            for (int i = 0; i < n; i++) {
                if (i % 2 == 0) {
                    current++;
                } else {
                    current--;
                }
            }
            return current;
            ```
        """.trimIndent()
        assertTrue(invokeContainsCompleteSolution(reply2, null))
    }

    @Test
    fun `should detect multiple substantial code blocks`() {
        val reply = """
            ```python
            def part1():
                x = 1
                y = 2
                return x + y
            ```
            ```python
            def part2():
                x = 1
                y = 2
                return x + y
            ```
            ```python
            def part3():
                x = 1
                y = 2
                return x + y
            ```
        """.trimIndent()
        assertTrue(invokeContainsCompleteSolution(reply, null))
    }
}

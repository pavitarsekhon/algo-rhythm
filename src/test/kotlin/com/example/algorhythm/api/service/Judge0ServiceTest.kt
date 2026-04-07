package com.example.algorhythm.api.service

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.web.reactive.function.client.WebClient
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.repository.IOPairRepository
import com.example.algorhythm.api.repository.UserSessionRepository

@ExtendWith(MockitoExtension::class)
class Judge0ServiceTest {

    @Mock private lateinit var webClient: WebClient
    @Mock private lateinit var questionRepository: QuestionRepository
    @Mock private lateinit var ioPairRepository: IOPairRepository
    @Mock private lateinit var userSessionRepository: UserSessionRepository
    @Mock private lateinit var userSessionService: UserSessionService

    @InjectMocks
    private lateinit var judge0Service: Judge0Service

    @Test
    fun `normalize should handle null`() {
        val result = judge0Service.normalize(null)
        assertEquals("", result)
    }

    @Test
    fun `normalize should replace crlf with lf and trim whitespace`() {
        val result = judge0Service.normalize("  output\r\nhere  \r")
        assertEquals("output\nhere", result)
    }

    @Test
    fun `wrapFunctionCode should correctly build python wrapper for regular function`() {
        val userCode = """
            def my_func(nums, target):
                return sum(nums) + target
        """.trimIndent()
        
        val inputText = "nums = [1, 2], target = 4"
        val result = judge0Service.wrapFunctionCode(userCode, inputText, "python")
        
        // Build expected
        val expected = """
            def my_func(nums, target):
                return sum(nums) + target

            if __name__ == "__main__":
                result = my_func([1, 2], 4)
                print(result)
        """.trimIndent()
        
        assertEquals(expected + "\n", result)
    }

    @Test
    fun `wrapFunctionCode should correctly build python wrapper for class based solution`() {
        val userCode = """
            class Solution:
                def twoSum(self, nums, target):
                    return [1, 2]
        """.trimIndent()

        val inputText = "nums = [2, 7, 11, 15], target = 9"
        val result = judge0Service.wrapFunctionCode(userCode, inputText, "python")
        
        val expected = """
            class Solution:
                def twoSum(self, nums, target):
                    return [1, 2]

            if __name__ == "__main__":
                result = Solution().twoSum([2, 7, 11, 15], 9)
                print(result)
        """.trimIndent()
        
        assertEquals(expected + "\n", result)
    }
}

package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class QuestionServiceTest {

    @Mock
    private lateinit var questionRepository: QuestionRepository

    @InjectMocks
    private lateinit var questionService: QuestionService

    @Test
    fun `generateQuestion should return a random question for the given difficulty`() {
        val q1 = Question(id = 1, difficulty = QuestionDifficulty.EASY, prompt = "P1", functionName = "f1", topics = "Array", starterCode = "def f1():\n    pass")
        val q2 = Question(id = 2, difficulty = QuestionDifficulty.EASY, prompt = "P2", functionName = "f2", topics = "String", starterCode = "def f2():\n    pass")
        `when`(questionRepository.findByDifficulty(QuestionDifficulty.EASY)).thenReturn(listOf(q1, q2))

        val result = questionService.generateQuestion(QuestionDifficulty.EASY, "beginner")
        assert(result == q1 || result == q2)
    }

    @Test
    fun `generateQuestion should throw exception when no questions are available`() {
        `when`(questionRepository.findByDifficulty(QuestionDifficulty.HARD)).thenReturn(emptyList())

        val exception = assertThrows(IllegalArgumentException::class.java) {
            questionService.generateQuestion(QuestionDifficulty.HARD, "advanced")
        }
        assertEquals("No questions available for difficulty: Hard", exception.message)
    }
}

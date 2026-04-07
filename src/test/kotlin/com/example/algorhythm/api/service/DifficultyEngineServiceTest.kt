package com.example.algorhythm.api.service

import com.example.algorhythm.api.enum.QuestionDifficulty
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class DifficultyEngineServiceTest {

    @InjectMocks
    private lateinit var difficultyEngineService: DifficultyEngineService

    @Test
    fun `should decrease difficulty when attempts are more than 5`() {
        val result = difficultyEngineService.adjustDifficulty(QuestionDifficulty.MEDIUM, 6, 0)
        assertEquals(QuestionDifficulty.EASY, result)
    }

    @Test
    fun `should increase difficulty when quick solve streak is 2 or more`() {
        val result = difficultyEngineService.adjustDifficulty(QuestionDifficulty.EASY, 1, 2)
        assertEquals(QuestionDifficulty.MEDIUM, result)
    }

    @Test
    fun `should retain current difficulty when attempts are 5 or less and quick solve streak is less than 2`() {
        val result = difficultyEngineService.adjustDifficulty(QuestionDifficulty.MEDIUM, 3, 1)
        assertEquals(QuestionDifficulty.MEDIUM, result)
    }

    @Test
    fun `should handle edge cases for highest difficulty promotion`() {
        val result = difficultyEngineService.adjustDifficulty(QuestionDifficulty.HARD, 1, 2)
        assertEquals(QuestionDifficulty.HARD, result)
    }
    
    @Test
    fun `should handle edge cases for lowest difficulty demotion`() {
        val result = difficultyEngineService.adjustDifficulty(QuestionDifficulty.EASY, 6, 0)
        assertEquals(QuestionDifficulty.EASY, result)
    }
}


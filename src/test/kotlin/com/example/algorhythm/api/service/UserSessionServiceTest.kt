package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.domain.UserSession
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.UserSessionRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import java.util.*

@ExtendWith(MockitoExtension::class)
class UserSessionServiceTest {

    @Mock
    private lateinit var userSessionRepository: UserSessionRepository

    @InjectMocks
    private lateinit var userSessionService: UserSessionService

    private lateinit var mockUserSession: UserSession

    @BeforeEach
    fun setUp() {
        val user = User(id = 1, username = "testuser", password = "password", age = 20, knownLanguages = "Python", experienceLevel = "beginner")
        mockUserSession = UserSession(id = 1, user = user, totalAttempts = 5, active = true, currentDifficulty = QuestionDifficulty.EASY, currentQuestionId = 1)
    }

    @Test
    fun `incrementTotalAttempts should increase attempts by 1 when session exists`() {
        `when`(userSessionRepository.findByUserId(1L)).thenReturn(mockUserSession)

        userSessionService.incrementTotalAttempts(1L)

        assertEquals(6, mockUserSession.totalAttempts)
        verify(userSessionRepository, times(1)).save(mockUserSession)
    }

    @Test
    fun `incrementTotalAttempts should throw exception when session not found`() {
        `when`(userSessionRepository.findByUserId(2L)).thenReturn(null)

        val exception = assertThrows(IllegalStateException::class.java) {
            userSessionService.incrementTotalAttempts(2L)
        }

        assertEquals("User session not found", exception.message)
        verify(userSessionRepository, never()).save(any())
    }
}

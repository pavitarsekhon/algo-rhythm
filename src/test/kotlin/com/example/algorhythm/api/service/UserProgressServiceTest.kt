package com.example.algorhythm.api.service

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.domain.UserProgress
import com.example.algorhythm.api.repository.UserProgressRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class UserProgressServiceTest {

    @Mock
    private lateinit var userProgressRepository: UserProgressRepository

    @InjectMocks
    private lateinit var userProgressService: UserProgressService

    private lateinit var mockUser: User
    private lateinit var mockProgress: UserProgress

    @BeforeEach
    fun setUp() {
        mockUser = User(id = 1, username = "testuser", password = "password", age = 20, knownLanguages = "Python", experienceLevel = "beginner")
        mockProgress = UserProgress(id = 1, user = mockUser, topicProgressJson = "{\"Array\": 40}")
    }

    @Test
    fun `getTopicProgressMap should return map of progress`() {
        val result = userProgressService.getTopicProgressMap(mockProgress)
        assertEquals(1, result.size)
        assertEquals(40, result["Array"])
    }

    @Test
    fun `getTopicProgressMap should handle empty json`() {
        mockProgress.topicProgressJson = ""
        val result = userProgressService.getTopicProgressMap(mockProgress)
        assertTrue(result.isEmpty())
    }

    @Test
    fun `updateTopicProgress should calculate correctly for new exponential moving average`() {
        `when`(userProgressRepository.findByUserId(1L)).thenReturn(mockProgress)

        val update = userProgressService.updateTopicProgress(user = mockUser, topicKey = "Array", quizScore = 80, alpha = 0.5)

        // previous = 40. updated = 40 + 0.5 * (80 - 40) = 60
        assertEquals(40, update.previous)
        assertEquals(60, update.updated)
        verify(userProgressRepository, times(1)).save(mockProgress)
        assertTrue(mockProgress.topicProgressJson!!.contains("\"Array\":60"))
    }

    @Test
    fun `updateTopicProgress should handle entirely new topic`() {
        `when`(userProgressRepository.findByUserId(1L)).thenReturn(mockProgress)

        val update = userProgressService.updateTopicProgress(user = mockUser, topicKey = "HashMap", quizScore = 100, alpha = 0.5)

        // previous = 0. updated = 0 + 0.5 * (100 - 0) = 50
        assertEquals(0, update.previous)
        assertEquals(50, update.updated)
        verify(userProgressRepository, times(1)).save(mockProgress)
        assertTrue(mockProgress.topicProgressJson!!.contains("\"HashMap\":50"))
    }
}

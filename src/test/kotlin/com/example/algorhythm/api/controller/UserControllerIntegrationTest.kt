package com.example.algorhythm.api.controller

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.repository.UserProgressRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userSessionRepository: UserSessionRepository

    @Autowired
    private lateinit var userProgressRepository: UserProgressRepository

    @BeforeEach
    fun setup() {
        userSessionRepository.deleteAll()
        userProgressRepository.deleteAll()
        userRepository.deleteAll()

        val user = User(
            username = "test_user",
            password = "password123",
            age = 25,
            experienceLevel = "beginner",
            knownLanguages = "Python",
            isAdmin = false
        )
        userRepository.save(user)
    }

    @Test
    @WithMockUser(username = "test_user")
    fun `should get user profile`() {
        mockMvc.perform(get("/api/user/profile")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.username").value("test_user"))
            .andExpect(jsonPath("$.experienceLevel").value("beginner"))
    }

    @Test
    fun `should return unauthorized if not logged in`() {
        mockMvc.perform(get("/api/user/profile")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden)
    }
}



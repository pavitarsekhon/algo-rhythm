package com.example.algorhythm.api.controller

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.repository.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository
    
    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setup() {
        userRepository.deleteAll()
    }

    @Test
    fun `should register user successfully`() {
        val request = AuthRequest(
            username = "new_user",
            password = "password123",
            age = 25,
            experienceLevel = "beginner",
            knownLanguages = "Python"
        )

        mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(content().string("User registered successfully"))
    }

    @Test
    fun `should login user successfully`() {
        // Pre-create user
        val user = User(
            username = "login_user",
            password = passwordEncoder.encode("password123"),
            age = 22,
            experienceLevel = "intermediate",
            knownLanguages = "Java",
            isAdmin = false
        )
        userRepository.save(user)

        val request = LoginRequest(
            username = "login_user",
            password = "password123"
        )

        mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").exists())
    }
}


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
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userSessionRepository: com.example.algorhythm.api.repository.UserSessionRepository

    @Autowired
    private lateinit var userProgressRepository: com.example.algorhythm.api.repository.UserProgressRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setup() {
        userSessionRepository.deleteAll()
        userProgressRepository.deleteAll()
        userRepository.deleteAll()

        val adminUser = User(
            username = "admin_user",
            password = "password",
            age = 30,
            experienceLevel = "expert",
            knownLanguages = "Kotlin",
            isAdmin = true
        )
        userRepository.save(adminUser)

        val regularUser = User(
            username = "regular_user",
            password = "password",
            age = 20,
            experienceLevel = "beginner",
            knownLanguages = "Java",
            isAdmin = false
        )
        userRepository.save(regularUser)
    }

    @Test
    @WithMockUser(username = "admin_user")
    fun `should return true for admin check`() {
        mockMvc.perform(get("/api/admin/check")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.isAdmin").value(true))
    }

    @Test
    @WithMockUser(username = "regular_user")
    fun `should return false for regular user admin check`() {
        mockMvc.perform(get("/api/admin/check")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.isAdmin").value(false))
    }

    @Test
    @WithMockUser(username = "admin_user")
    fun `should get all users`() {
        mockMvc.perform(get("/api/admin/users")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
    }

    @Test
    @WithMockUser(username = "regular_user")
    fun `should forbid non-admin from getting users`() {
        mockMvc.perform(get("/api/admin/users")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden)
    }

    @Test
    @WithMockUser(username = "admin_user")
    fun `should set admin status`() {
        val user = userRepository.findByUsername("regular_user").get()
        val request = SetAdminRequest(isAdmin = true)

        mockMvc.perform(put("/api/admin/users/${user.id}/admin")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.username").value("regular_user"))
            .andExpect(jsonPath("$.isAdmin").value(true))
    }
}




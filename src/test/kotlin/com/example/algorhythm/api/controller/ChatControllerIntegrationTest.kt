package com.example.algorhythm.api.controller

import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.domain.UserSession
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.repository.QuestionRepository
import com.example.algorhythm.api.repository.UserRepository
import com.example.algorhythm.api.repository.UserSessionRepository
import com.example.algorhythm.api.service.ChatService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.ArgumentMatchers.anyString
import org.mockito.ArgumentMatchers.anyLong
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChatControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository
    
    @Autowired
    private lateinit var userSessionRepository: UserSessionRepository

    @Autowired
    private lateinit var questionRepository: QuestionRepository

    @MockBean
    private lateinit var chatService: ChatService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setup() {
        userSessionRepository.deleteAll()
        questionRepository.deleteAll()
        userRepository.deleteAll()

        val user = User(
            username = "chat_user",
            password = "password",
            age = 20,
            experienceLevel = "beginner",
            knownLanguages = "Python",
            isAdmin = false
        )
        val savedUser = userRepository.save(user)

        val question = Question(
            topics = "array",
            difficulty = QuestionDifficulty.EASY,
            prompt = "Test prompt",
            functionName = "testFn",
            starterCode = "def testFn(): pass"
        )
        val savedQuestion = questionRepository.save(question)

        val session = UserSession(
            user = savedUser,
            active = true,
            currentDifficulty = QuestionDifficulty.EASY,
            currentQuestionId = savedQuestion.id,
            topicCheckRequired = false,
            topicCheckPassed = true
        )
        userSessionRepository.save(session)
    }

    @Test
    @WithMockUser(username = "chat_user")
    fun `should send chat message and return response`() {
        val request = ChatRequest(
            message = "How do I solve this?",
            code = "def testFn(): pass"
        )

        `when`(chatService.chat(anyLong(), anyString(), anyString())).thenReturn("This is a helpful reply")

        mockMvc.perform(post("/api/chat")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.reply").value("This is a helpful reply"))
    }
}


package com.example.algorhythm

import com.example.algorhythm.api.domain.User
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.example.algorhythm.api.domain.UserSession
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
import org.springframework.boot.test.mock.mockito.MockBean
import org.mockito.Mockito.`when`
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.eq
import com.example.algorhythm.api.service.Judge0Service
import com.example.algorhythm.api.service.SubmitResultResponse
import com.example.algorhythm.api.service.TestResult
import com.example.algorhythm.api.service.TopicCheckAnswer
import com.example.algorhythm.api.controller.QuestionController.CodeSubmissionRequest
import com.example.algorhythm.api.controller.QuestionController.TopicCheckSubmitRequest
import com.example.algorhythm.api.domain.Question
import com.example.algorhythm.api.repository.QuestionRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QuestionControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userSessionRepository: UserSessionRepository

    @Autowired
    private lateinit var userProgressRepository: UserProgressRepository

    @Autowired
    private lateinit var questionRepository: QuestionRepository

    @MockBean
    private lateinit var judge0Service: Judge0Service

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setup() {
        userSessionRepository.deleteAll()
        userProgressRepository.deleteAll()
        questionRepository.deleteAll()
        userRepository.deleteAll()

        val user = User(
            username = "integration_test_user",
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
            starterCode = "def testFn():\n    pass"
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
    @WithMockUser(username = "integration_test_user")
    fun `should return current question successfully`() {
        mockMvc.perform(get("/api/questions/current")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.topics").value("array"))
    }

    @Test
    @WithMockUser(username = "integration_test_user")
    fun `should fetch next question successfully`() {
        // Pre-req: add one more question so the next engine has something to query
        val newQuestion = Question(
            topics = "string",
            difficulty = QuestionDifficulty.EASY,
            prompt = "New Test prompt",
            functionName = "testFn2",
            starterCode = "def testFn2():\n    pass"
        )
        questionRepository.save(newQuestion)

        mockMvc.perform(get("/api/questions/next")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.prompt").exists())
    }

    @Test
    @WithMockUser(username = "integration_test_user")
    fun `should generate topic check questions successfully`() {
        // Change user session to require a topic check
        val user = userRepository.findByUsername("integration_test_user").get()
        val session = userSessionRepository.findByUserId(user.id)!!
        session.topicCheckRequired = true
        session.topicCheckPassed = false
        userSessionRepository.save(session)

        val questionId = questionRepository.findAll().first().id
        val request = com.example.algorhythm.api.controller.QuestionController.TopicCheckRequest(questionId)

        mockMvc.perform(post("/api/questions/topic-check")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
    }

    @Test
    @WithMockUser(username = "integration_test_user")
    fun `should mock run-tests execution successfully`() {
        val questionId = questionRepository.findAll().first().id
        val userId = userRepository.findAll().first().id
        val submitResult = SubmitResultResponse(
            allPassed = true,
            results = listOf(TestResult("input", "output", "output", null, true))
        )
        val request = CodeSubmissionRequest("def test(): pass", "python", null, questionId, null)

        // Run tests doesn't affect user progress
        `when`(judge0Service.runTestCases(request, userId)).thenReturn(submitResult)

        mockMvc.perform(post("/api/questions/run-tests")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.allPassed").value(true))
    }

    @Test
    @WithMockUser(username = "integration_test_user")
    fun `should submit topic check and update status`() {
        val questionId = questionRepository.findAll().first().id
        val answers = listOf(
            TopicCheckAnswer("tf-$questionId-1", true),
            TopicCheckAnswer("tf-$questionId-2", false),
            TopicCheckAnswer("tf-$questionId-3", true),
            TopicCheckAnswer("tf-$questionId-4", false),
            TopicCheckAnswer("tf-$questionId-5", true)
        )
        val request = TopicCheckSubmitRequest(questionId, answers)

        mockMvc.perform(post("/api/questions/topic-check/submit")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.passed").value(true))
            .andExpect(jsonPath("$.score").value(100))
    }

    @Test
    @WithMockUser(username = "integration_test_user")
    fun `should mock judge0 execution successfully`() {
        val questionId = questionRepository.findAll().first().id
        val userId = userRepository.findAll().first().id
        val submitResult = SubmitResultResponse(
            allPassed = true,
            results = listOf(TestResult("input", "output", "output", null, true))
        )
        
        val request = CodeSubmissionRequest("def test(): pass", "python", null, questionId, null)

        `when`(judge0Service.submitCode(request, userId))
            .thenReturn(submitResult)

        mockMvc.perform(post("/api/questions/submit")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.allPassed").value(true))
    }

    @Test
    @WithMockUser(username = "integration_test_user")
    fun `should return topic check status successfully`() {
        val questionId = questionRepository.findAll().first().id
        mockMvc.perform(get("/api/questions/topic-check/status")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.required").value(false))
            .andExpect(jsonPath("$.passed").value(true))
            .andExpect(jsonPath("$.currentQuestionId").value(questionId))
    }
}





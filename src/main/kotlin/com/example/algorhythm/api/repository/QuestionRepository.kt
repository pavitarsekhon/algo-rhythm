package com.example.algorhythm.api.repository

import com.example.algorhythm.api.domain.Question
import org.springframework.data.jpa.repository.JpaRepository

interface QuestionRepository : JpaRepository<Question, Long>
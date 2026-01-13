package com.example.algorhythm.api.repository

import com.example.algorhythm.api.domain.ChatMessage
import org.springframework.data.jpa.repository.JpaRepository

interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    fun findTop5ByUserIdOrderByTimestamp(userId: Long): List<ChatMessage>
}
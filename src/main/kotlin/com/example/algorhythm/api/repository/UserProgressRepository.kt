package com.example.algorhythm.api.repository

import com.example.algorhythm.api.domain.UserProgress
import org.springframework.data.jpa.repository.JpaRepository

interface UserProgressRepository : JpaRepository<UserProgress, Long> {
    fun findByUserId(userId: Long): UserProgress?
}


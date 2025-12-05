package com.example.algorhythm.api.repository

import com.example.algorhythm.api.domain.UserSession
import org.springframework.data.jpa.repository.JpaRepository

interface UserSessionRepository: JpaRepository<UserSession, String> {

    fun findByActiveIsTrue(): UserSession

    fun findByUserId(userId: Long): UserSession?
}
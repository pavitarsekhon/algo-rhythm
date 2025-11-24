package com.example.algorhythm.api.controller

import com.example.algorhythm.api.repository.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import com.example.algorhythm.api.domain.User

data class UserProfileUpdateRequest (
    val age: Int?,
    val experienceLevel: String?,
    val knownLanguages: String?
)
@RestController
@RequestMapping("/api/user")
class UserController(
    private val userRepository: UserRepository
) {
    @PutMapping("/profile")
    fun updateProfile(
        @AuthenticationPrincipal user: org.springframework.security.core.userdetails.User,
        @RequestBody request: UserProfileUpdateRequest
    ) : ResponseEntity<User> {
        val dbUser = userRepository.findByUsername(user.username)
            .orElseThrow { IllegalArgumentException("User with username ${user.username} does not exist") }

        dbUser.age = request.age
        dbUser.experienceLevel = request.experienceLevel
        dbUser.knownLanguages = request.knownLanguages

        val updated = userRepository.save(dbUser)
        return ResponseEntity.ok(updated)
    }

}
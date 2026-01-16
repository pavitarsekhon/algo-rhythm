package com.example.algorhythm.api.controller

import com.example.algorhythm.api.service.AdminService
import com.example.algorhythm.api.service.AdminStatsDTO
import com.example.algorhythm.api.service.UserDTO
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val adminService: AdminService
) {

    /**
     * Check if the current user is an admin
     */
    @GetMapping("/check")
    fun checkAdminStatus(): ResponseEntity<AdminCheckResponse> {
        val username = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val isAdmin = adminService.isAdmin(username)
        return ResponseEntity.ok(AdminCheckResponse(isAdmin))
    }

    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/stats")
    fun getStats(): ResponseEntity<AdminStatsDTO> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return ResponseEntity.ok(adminService.getStats())
    }

    /**
     * Get all users
     */
    @GetMapping("/users")
    fun getAllUsers(): ResponseEntity<List<UserDTO>> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return ResponseEntity.ok(adminService.getAllUsers())
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{userId}")
    fun getUserById(@PathVariable userId: Long): ResponseEntity<UserDTO> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        val user = adminService.getUserById(userId)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(user)
    }

    /**
     * Update user admin status
     */
    @PutMapping("/users/{userId}/admin")
    fun setAdminStatus(
        @PathVariable userId: Long,
        @RequestBody request: SetAdminRequest
    ): ResponseEntity<UserDTO> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        val user = adminService.setAdminStatus(userId, request.isAdmin)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(user)
    }

    /**
     * Delete a user
     */
    @DeleteMapping("/users/{userId}")
    fun deleteUser(@PathVariable userId: Long): ResponseEntity<Void> {
        if (!isCurrentUserAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        return if (adminService.deleteUser(userId)) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    private fun isCurrentUserAdmin(): Boolean {
        val username = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: return false
        return adminService.isAdmin(username)
    }
}

data class AdminCheckResponse(val isAdmin: Boolean)
data class SetAdminRequest(val isAdmin: Boolean)

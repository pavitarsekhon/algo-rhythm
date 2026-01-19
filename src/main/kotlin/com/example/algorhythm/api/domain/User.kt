package com.example.algorhythm.api.domain

import jakarta.persistence.*

@Entity
@Table(name = "users")
class User (

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val username: String,

    @Column(nullable = false)
    val password: String,

    var age: Int? = null,
    var experienceLevel: String? = null,
    var knownLanguages: String? = null,

    @Column(name = "is_admin", nullable = false)
    var isAdmin: Boolean = false
)

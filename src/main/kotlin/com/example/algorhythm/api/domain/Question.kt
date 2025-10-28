package com.example.algorhythm.api.domain

import jakarta.persistence.*

@Entity
data class Question (

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val topic: String,
    val difficulty: String,

    @Column(columnDefinition = "TEXT")
    val prompt: String,

    @Column(columnDefinition = "TEXT")
    val hints: String? = null,

    @OneToMany(mappedBy = "question", cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    val ioPairs:MutableList<IOPair> = mutableListOf()
)
package com.example.algorhythm.api.domain

import com.example.algorhythm.api.enum.ExecutionType
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*

@Entity
class Question (

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Enumerated(EnumType.STRING)
    val executionType: ExecutionType = ExecutionType.STDIN,

    val topic: String,

    @Enumerated(EnumType.STRING)
    val difficulty: QuestionDifficulty,

    @Column(columnDefinition = "TEXT")
    val prompt: String,

    @Column(columnDefinition = "TEXT")
    val hints: String? = null,

    @OneToMany(mappedBy = "question", cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    @JsonManagedReference
    val ioPairs:MutableList<IOPair> = mutableListOf()
)
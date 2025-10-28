package com.example.algorhythm.api.domain

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne

@Entity
data class IOPair(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(columnDefinition = "TEXT")
    val inputText: String,

    @Column(columnDefinition = "TEXT")
    val expectedOutput: String,

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "question_id")
    val question: Question? = null

)

package com.example.algorhythm.api.domain

import com.example.algorhythm.api.enum.ExecutionType
import com.example.algorhythm.api.enum.QuestionDifficulty
import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import org.springframework.boot.context.properties.bind.DefaultValue

@Entity
class Question (

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Enumerated(EnumType.STRING)
    @DefaultValue("STDIN")
    val executionType: ExecutionType = ExecutionType.STDIN,

    @Column(columnDefinition = "TEXT")
    val topics: String,

    @Enumerated(EnumType.STRING)
    val difficulty: QuestionDifficulty,

    @Column(columnDefinition = "TEXT")
    val prompt: String,

    @Column(name = "function_name")
    val functionName: String? = null,  // e.g., "twoSum" - optional, for reference only

    @Column(columnDefinition = "TEXT")
    val starterCode: String? = null,

    @OneToMany(mappedBy = "question", cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    @JsonManagedReference
    val ioPairs:MutableList<IOPair> = mutableListOf()
)
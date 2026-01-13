package com.example.algorhythm.api.enum

import com.fasterxml.jackson.annotation.JsonProperty

enum class QuestionDifficulty {
    @JsonProperty("Easy")
    EASY,

    @JsonProperty("Medium")
    MEDIUM,

    @JsonProperty("Hard")
    HARD;

    override fun toString(): String = when(this) {
        EASY -> "Easy"
        MEDIUM -> "Medium"
        HARD -> "Hard"
    }
}
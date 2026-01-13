package com.example.algorhythm.api.service

import com.example.algorhythm.api.enum.QuestionDifficulty
import org.springframework.stereotype.Service

@Service
class DifficultyEngineService {

    fun adjustDifficulty(current: QuestionDifficulty, attempts: Int, lastCorrect: Boolean): QuestionDifficulty {

        return when {
            lastCorrect && attempts == 1 -> increase(current)
            !lastCorrect && attempts > 2 -> decrease(current)
            else -> current
        }
    }

    private fun increase(d: QuestionDifficulty): QuestionDifficulty =
        when (d) {
            QuestionDifficulty.EASY -> QuestionDifficulty.MEDIUM
            QuestionDifficulty.MEDIUM -> QuestionDifficulty.HARD
            QuestionDifficulty.HARD -> QuestionDifficulty.HARD
        }

    private fun decrease(d: QuestionDifficulty): QuestionDifficulty =
        when (d) {
            QuestionDifficulty.HARD -> QuestionDifficulty.MEDIUM
            QuestionDifficulty.MEDIUM -> QuestionDifficulty.EASY
            QuestionDifficulty.EASY -> QuestionDifficulty.EASY
        }


}
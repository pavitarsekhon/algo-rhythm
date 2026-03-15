package com.example.algorhythm.api.service

import com.example.algorhythm.api.enum.QuestionDifficulty
import org.springframework.stereotype.Service

@Service
class DifficultyEngineService {

    fun adjustDifficulty(
        current: QuestionDifficulty,
        attempts: Int,
        quickSolveStreak: Int
    ): QuestionDifficulty {
        val struggled = attempts > 5

        return when {
            struggled -> decrease(current)
            // Promote only after two consecutive quick solves at the same level.
            quickSolveStreak >= 2 -> increase(current)
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
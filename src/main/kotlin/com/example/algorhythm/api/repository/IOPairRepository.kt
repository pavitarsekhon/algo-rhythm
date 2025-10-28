package com.example.algorhythm.api.repository

import com.example.algorhythm.api.domain.IOPair
import org.springframework.data.jpa.repository.JpaRepository

interface IOPairRepository : JpaRepository<IOPair, Long>
package com.example.algorhythm.api.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.util.Date

@Component
class JwtUtil {
    private val key = Keys.secretKeyFor(SignatureAlgorithm.HS256)

    fun generateToken(username: String): String {
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(Date())
            .setExpiration(Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
            .signWith(key)
            .compact()
    }

    fun extractUsername(token: String): String? {
        return try {
            val claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)
            claims.body.subject
        } catch (e: Exception) {
            null
        }
    }
}
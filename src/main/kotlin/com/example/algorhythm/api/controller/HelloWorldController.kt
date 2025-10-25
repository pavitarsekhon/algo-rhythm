package com.example.algorhythm.api.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HelloWorldController {

    @GetMapping("/api/hello")
    fun hello(): String {
        return "Hello from Kotlin + Spring Boot!"
    }
}
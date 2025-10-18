package com.tradedefense.backend.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "ai")
data class AiProperties(
    var baseUrl: String = "http://localhost:8000"
)

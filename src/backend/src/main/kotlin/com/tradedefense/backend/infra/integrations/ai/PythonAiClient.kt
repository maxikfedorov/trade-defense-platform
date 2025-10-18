package com.tradedefense.backend.infra.integrations.ai

import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.core.ParameterizedTypeReference

@Component
class PythonAiClient {
    private val client = RestClient.create()
    private val mapType = object : ParameterizedTypeReference<Map<String, Any?>>() {}

    fun evaluateByCode(baseUrl: String, code: String): Map<String, Any?> {
        val payload = mapOf("code" to code)
        return client.post()
            .uri("$baseUrl/reco/evaluate")   // эндпойнт Python-сервиса
            .contentType(MediaType.APPLICATION_JSON)
            .body(payload)
            .retrieve()
            .body(mapType) ?: emptyMap()
    }
}

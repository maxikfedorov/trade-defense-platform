package com.tradedefense.backend.infra.integrations.ai

import com.tradedefense.backend.api.dto.reco.AnalyzeRequestDto
import com.tradedefense.backend.api.dto.reco.GenerateRequestDto
import com.tradedefense.backend.api.dto.reco.GenerateResponseDto
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class PythonAiClient {
    private val client = RestClient.create()
    private val mapType = object : ParameterizedTypeReference<Map<String, Any?>>() {}

    fun analyze(baseUrl: String, req: AnalyzeRequestDto): Map<String, Any?> =
        client.post().uri("$baseUrl/analyze")
            .contentType(MediaType.APPLICATION_JSON)
            .body(req)
            .retrieve()
            .body(mapType) ?: emptyMap()

    fun generate(baseUrl: String, req: GenerateRequestDto): GenerateResponseDto =
        client.post().uri("$baseUrl/generate")
            .contentType(MediaType.APPLICATION_JSON)
            .body(req)
            .retrieve()
            .body(GenerateResponseDto::class.java) ?: GenerateResponseDto()
}

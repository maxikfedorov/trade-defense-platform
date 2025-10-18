package com.tradedefense.backend.app.services

import com.tradedefense.backend.api.dto.reco.*
import com.tradedefense.backend.config.AiProperties
import com.tradedefense.backend.infra.integrations.ai.PythonAiClient
import org.springframework.stereotype.Service

@Service
class AiGatewayService(
    private val aiProps: AiProperties,
    private val aiClient: PythonAiClient
) {
    fun analyze(tnvedCode: String, productName: String?): Map<String, Any?> =
        aiClient.analyze(aiProps.baseUrl, AnalyzeRequestDto(tnvedCode.trim(), productName?.trim()))

    fun generate(algorithmResult: Map<String, Any?>, userPrompt: String?): GenerateResponseDto =
        aiClient.generate(aiProps.baseUrl, GenerateRequestDto(algorithmResult, userPrompt))
}

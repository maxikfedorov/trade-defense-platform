package com.tradedefense.backend.app.services

import com.tradedefense.backend.config.AiProperties
import com.tradedefense.backend.infra.integrations.ai.PythonAiClient
import org.springframework.stereotype.Service

@Service
class AiGatewayService(
    private val aiProps: AiProperties,
    private val aiClient: PythonAiClient
) {
    fun evaluateByCode(code: String): Map<String, Any?> =
        aiClient.evaluateByCode(aiProps.baseUrl, code.trim())
}

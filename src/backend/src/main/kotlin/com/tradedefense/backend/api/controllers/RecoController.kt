package com.tradedefense.backend.api.controllers

import com.tradedefense.backend.api.dto.reco.*
import com.tradedefense.backend.app.services.AiGatewayService
import com.tradedefense.backend.app.services.AnalyzeCache
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/v1/reco")
class RecoController(
    private val aiGateway: AiGatewayService,
    private val analyzeCache: AnalyzeCache
) {

    @PostMapping("/evaluate")
    fun evaluate(@RequestBody body: EvaluateHttpRequest): EvaluateHttpResponse {
        if (body.tnvedCode.isBlank()) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "tnved_code must not be blank")
        val result = aiGateway.analyze(body.tnvedCode, body.productName)
        val analyzeId = analyzeCache.put(result)
        return EvaluateHttpResponse(analyzeId = analyzeId, result = result)
    }

    @PostMapping("/generate")
    fun generate(@RequestBody body: GenerateHttpRequest): GenerateResponseDto {
        if (body.analyzeId.isBlank()) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "analyze_id must not be blank")
        val cached = analyzeCache.get(body.analyzeId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "analyze_id not found or expired")

        // Валидация минимально нужных полей для Python /generate
        validateAlgorithmResult(cached)

        return aiGateway.generate(cached, body.userPrompt)
    }

    private fun validateAlgorithmResult(algo: Map<String, Any?>) {
        val meta = algo["metadata"] as? Map<*, *>
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "algorithm_result.metadata required")
        if (!meta.containsKey("product_name")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "algorithm_result.metadata.product_name required")
        }
        val tmeas = algo["tariff_measures"] as? Map<*, *>
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "algorithm_result.tariff_measures required")
        if (!tmeas.containsKey("measures")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "algorithm_result.tariff_measures.measures required")
        }
    }
}

package com.tradedefense.backend.api.controllers

import com.tradedefense.backend.api.dto.reco.RecoRequest
import com.tradedefense.backend.app.services.AiGatewayService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/reco")
class RecoController(
    private val aiGateway: AiGatewayService
) {

    @PostMapping("/evaluate")
    fun evaluate(@RequestBody body: RecoRequest): Map<String, Any?> {
        require(body.code.isNotBlank()) { "code must not be blank" }
        return aiGateway.evaluateByCode(body.code)
    }
}

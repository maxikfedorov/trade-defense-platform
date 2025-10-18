package com.tradedefense.backend.api.dto.reco

import com.fasterxml.jackson.annotation.JsonProperty

data class EvaluateHttpRequest(
    @JsonProperty("tnved_code") val tnvedCode: String,
    @JsonProperty("product_name") val productName: String? = null
)

data class EvaluateHttpResponse(
    @JsonProperty("analyze_id") val analyzeId: String,
    @JsonProperty("result") val result: Map<String, Any?>
)

data class GenerateHttpRequest(
    @JsonProperty("analyze_id") val analyzeId: String,
    @JsonProperty("user_prompt") val userPrompt: String? = null
)

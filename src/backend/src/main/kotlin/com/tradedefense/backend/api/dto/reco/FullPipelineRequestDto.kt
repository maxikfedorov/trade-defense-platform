package com.tradedefense.backend.api.dto.reco

import com.fasterxml.jackson.annotation.JsonProperty

data class FullPipelineRequestDto(
    @JsonProperty("tnved_code")
    val tnvedCode: String,
    @JsonProperty("product_name")
    val productName: String? = null,
    @JsonProperty("user_prompt")
    val userPrompt: String? = null
)


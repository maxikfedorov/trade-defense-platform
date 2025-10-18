package com.tradedefense.backend.api.dto.reco

import com.fasterxml.jackson.annotation.JsonProperty

data class GenerateRequestDto(
    @JsonProperty("algorithm_result") val algorithmResult: Map<String, Any?>,
    @JsonProperty("user_prompt") val userPrompt: String? = null
)

data class RagSourceDto(
    val filename: String,
    @JsonProperty("relevance_score") val relevanceScore: Double
)

data class GenerateResponseDto(
    @JsonProperty("rag_queries") val ragQueries: List<String> = emptyList(),
    @JsonProperty("sources_found") val sourcesFound: Int = 0,
    @JsonProperty("top_sources") val topSources: List<RagSourceDto> = emptyList(),
    @JsonProperty("explanation") val explanation: String = ""
)

package com.tradedefense.backend.api.dto.common

data class HealthDto(
    val status: String = "ok",
    val versions: Versions = Versions(),
    val checks: Checks = Checks()
) {
    data class Versions(
        val api: String = "v1",
        val build: String = System.getenv("BUILD_VERSION") ?: "dev",
        val modelNLP: String? = System.getenv("NLP_MODEL_VERSION"),
        val modelLLM: String? = System.getenv("LLM_MODEL_VERSION")
    )
    data class Checks(
        val postgres: String = "unknown",
        val aiGateway: String = "skipped"
    )
}

package com.tradedefense.backend.api.dto.common

data class HealthDto(
    val status: String,
    val checks: Checks,
    val versions: Versions = Versions()
) {
    data class Checks(
        val postgres: String,
        val python: String,
        val aiGateway: String
    )
    data class Versions(
        val api: String = "v1",
        val build: String = System.getenv("BUILD_VERSION") ?: "dev"
    )
}

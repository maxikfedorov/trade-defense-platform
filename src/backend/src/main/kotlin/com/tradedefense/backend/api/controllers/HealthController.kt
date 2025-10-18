package com.tradedefense.backend.api.controllers

import com.tradedefense.backend.api.dto.common.HealthDto
import com.tradedefense.backend.app.services.PythonHealthClient
import com.tradedefense.backend.config.AiProperties
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestClient
import java.net.URI
import java.time.Duration

@RestController
@RequestMapping("/api/v1/health")
class HealthController(
    private val jdbcTemplate: JdbcTemplate,
    private val aiProps: AiProperties,
    private val pythonHealthClient: PythonHealthClient
) {

    @GetMapping
    fun health(): HealthDto {
        val pg = checkPostgres()
        val (pyMachine, pyHuman) = pythonHealthClient.checkDetailed(aiProps.baseUrl)
        val checks = HealthDto.Checks(
            postgres = pg,
            python = pyHuman,                  // пример: "healthy (customs-analysis-api v1.0.0)"
            aiGateway = checkAiGatewayConfigured()
        )
        val overall = if (pg == "up" && pyMachine == "up") "ok" else "degraded"
        return HealthDto(status = overall, versions = HealthDto.Versions(), checks = checks)
    }

    private fun checkPostgres(): String = try {
        jdbcTemplate.queryForObject("select 1", Int::class.java)
        "up"
    } catch (_: Exception) {
        "down"
    }

    private fun checkAiGatewayConfigured(): String =
        if (aiProps.baseUrl.isNotBlank()) "configured:${aiProps.baseUrl}" else "not_configured"
}

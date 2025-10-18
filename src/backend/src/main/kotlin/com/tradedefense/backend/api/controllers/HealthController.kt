package com.tradedefense.backend.api.controllers

import com.tradedefense.backend.api.dto.common.HealthDto
import com.tradedefense.backend.config.AiProperties
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/health")
class HealthController(
    private val jdbcTemplate: JdbcTemplate,
    private val aiProps: AiProperties
) {

    @GetMapping
    fun health(): HealthDto {
        val checks = HealthDto.Checks(
            postgres = checkPostgres(),
            aiGateway = checkAiGatewayConfigured()
        )
        return HealthDto(
            status = if (checks.postgres == "up") "ok" else "degraded",
            versions = HealthDto.Versions(),
            checks = checks
        )
    }

    private fun checkPostgres(): String = try {
        // лёгкий запрос; если datasource недоступен — будет исключение
        jdbcTemplate.queryForObject("select 1", Int::class.java)
        "up"
    } catch (ex: Exception) {
        "down"
    }

    private fun checkAiGatewayConfigured(): String =
        if (aiProps.baseUrl.isNotBlank()) "configured:${aiProps.baseUrl}" else "not_configured"
}

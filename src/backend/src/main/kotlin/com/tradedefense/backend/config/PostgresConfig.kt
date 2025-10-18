package com.tradedefense.backend.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.core.JdbcTemplate
import javax.sql.DataSource

@Configuration
class PostgresConfig(
    @Value("\${spring.datasource.url}") private val url: String,
    @Value("\${spring.datasource.username}") private val username: String,
    @Value("\${spring.datasource.password}") private val password: String,
    @Value("\${spring.datasource.hikari.maximum-pool-size:10}") private val maxPoolSize: Int,
    @Value("\${spring.datasource.hikari.minimum-idle:2}") private val minIdle: Int,
    @Value("\${spring.datasource.hikari.connection-timeout:30000}") private val connectionTimeoutMs: Long,
    @Value("\${spring.datasource.hikari.idle-timeout:600000}") private val idleTimeoutMs: Long,
    @Value("\${spring.datasource.hikari.max-lifetime:1800000}") private val maxLifetimeMs: Long
) {

    @Bean
    fun dataSource(): DataSource {
        val cfg = HikariConfig().apply {
            jdbcUrl = url
            this.username = this@PostgresConfig.username
            this.password = this@PostgresConfig.password
            maximumPoolSize = maxPoolSize
            minimumIdle = minIdle
            connectionTimeout = connectionTimeoutMs
            idleTimeout = idleTimeoutMs
            maxLifetime = maxLifetimeMs
            driverClassName = "org.postgresql.Driver"
            // Рекомендуемые настройки
            addDataSourceProperty("reWriteBatchedInserts", "true")
            addDataSourceProperty("stringtype", "unspecified")
        }
        return HikariDataSource(cfg)
    }

    @Bean
    fun jdbcTemplate(ds: DataSource) = JdbcTemplate(ds)
}

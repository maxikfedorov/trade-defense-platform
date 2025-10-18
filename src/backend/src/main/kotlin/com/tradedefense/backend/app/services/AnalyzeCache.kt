package com.tradedefense.backend.app.services

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.stereotype.Service
import java.time.Duration
import java.util.*

@Service
class AnalyzeCache {
    private val cache = Caffeine.newBuilder()
        .expireAfterWrite(Duration.ofMinutes(30)) // TTL 30 минут
        .maximumSize(1000)
        .build<String, Map<String, Any?>>()

    fun put(result: Map<String, Any?>): String {
        val id = UUID.randomUUID().toString()
        cache.put(id, result)
        return id
    }

    fun get(id: String): Map<String, Any?>? = cache.getIfPresent(id)

    fun remove(id: String) = cache.invalidate(id)
}

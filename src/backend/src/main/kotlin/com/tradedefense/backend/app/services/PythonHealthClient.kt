package com.tradedefense.backend.app.services

import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.net.URI

@Component
class PythonHealthClient {
    private final val client: RestClient

    init {
        val rf = SimpleClientHttpRequestFactory().apply {
            setConnectTimeout(2000)
            setReadTimeout(2000)
        }
        client = RestClient.builder().requestFactory(rf).build()
    }

    fun checkDetailed(baseUrl: String): Pair<String /*machine*/, String /*human*/> {
        if (baseUrl.isBlank()) return "down:not_configured" to "down (not_configured)"
        return try {
            val uri = URI.create("${baseUrl.trimEnd('/')}/health")
            val body = client.get().uri(uri).retrieve().body(Map::class.java) as? Map<*, *>
            val status = (body?.get("status") as? String)?.lowercase() ?: "unknown"
            val service = body?.get("service") as? String ?: "unknown"
            val version = body?.get("version") as? String ?: "unknown"
            val machine = if (status in listOf("healthy", "up", "ok")) "up" else "down:$status"
            val human = "$status ($service v$version)"
            machine to human
        } catch (e: Exception) {
            "down:${e::class.simpleName}" to "down (${e::class.simpleName})"
        }
    }
}

package com.tradedefense.backend.api.controllers

import com.tradedefense.backend.api.dto.data.WideRowDto
import com.tradedefense.backend.infra.db.pg.entities.WideParfumeEntity
import com.tradedefense.backend.infra.db.pg.entities.WideElevatorsEntity
import com.tradedefense.backend.infra.db.pg.entities.WideBankomatsEntity
import com.tradedefense.backend.infra.db.pg.repositories.WideParfumeRepository
import com.tradedefense.backend.infra.db.pg.repositories.WideElevatorsRepository
import com.tradedefense.backend.infra.db.pg.repositories.WideBankomatsRepository
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/v1/data")
class DataController(
    private val parfumeRepo: WideParfumeRepository,
    private val elevatorsRepo: WideElevatorsRepository,
    private val bankomatsRepo: WideBankomatsRepository
) {
    // -------- Parfume ----------
    @GetMapping("/parfume")
    fun parfume(
        @RequestParam(required = false) q: String?,          // фильтр по стране (подстрока)
        @RequestParam(required = false) sortBy: String?,     // usd2024|tons2024|country
        @RequestParam(defaultValue = "desc") order: String = "desc",
        @RequestParam(required = false) year: Int?           // если указан, вернём только нужные столбцы
    ): List<Map<String, Any?>> =
        mapWideRows(parfumeRepo.findAllFiltered(q), sortBy, order, year)

    // -------- Elevators ----------
    @GetMapping("/elevators")
    fun elevators(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) sortBy: String?,
        @RequestParam(defaultValue = "desc") order: String = "desc",
        @RequestParam(required = false) year: Int?
    ): List<Map<String, Any?>> =
        mapWideRows(elevatorsRepo.findAllFiltered(q), sortBy, order, year)

    // -------- Bankomats ----------
    @GetMapping("/bankomats")
    fun bankomats(
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false) sortBy: String?,
        @RequestParam(defaultValue = "desc") order: String = "desc",
        @RequestParam(required = false) year: Int?
    ): List<Map<String, Any?>> =
        mapWideRows(bankomatsRepo.findAllFiltered(q), sortBy, order, year)

    // ---------- helpers ----------
    private fun mapWideRows(
        rows: List<Any>,
        sortBy: String?,
        order: String,
        year: Int?
    ): List<Map<String, Any?>> {
        val mapped = rows.map { any ->
            when (any) {
                is WideParfumeEntity -> any.toDto()
                is WideElevatorsEntity -> any.toDto()
                is WideBankomatsEntity -> any.toDto()
                else -> error("Unsupported row type: ${any::class}")
            }
        }.map { dto ->
            if (year == null) {
                mapOf(
                    "country" to dto.country,
                    "value_usd_mln_2022" to dto.valueUsdMln2022,
                    "value_usd_mln_2023" to dto.valueUsdMln2023,
                    "value_usd_mln_2024" to dto.valueUsdMln2024,
                    "value_tons_2022" to dto.valueTons2022,
                    "value_tons_2023" to dto.valueTons2023,
                    "value_tons_2024" to dto.valueTons2024
                )
            } else {
                val usd = when (year) {
                    2022 -> dto.valueUsdMln2022
                    2023 -> dto.valueUsdMln2023
                    2024 -> dto.valueUsdMln2024
                    else -> null
                }
                val tons = when (year) {
                    2022 -> dto.valueTons2022
                    2023 -> dto.valueTons2023
                    2024 -> dto.valueTons2024
                    else -> null
                }
                mapOf("country" to dto.country, "usd_mln" to usd, "tons" to tons, "year" to year)
            }
        }

        val comparator = when (sortBy?.lowercase()) {
            "usd2024" -> compareBy<Map<String, Any?>> { (it["value_usd_mln_2024"] as? BigDecimal) ?: BigDecimal.ZERO }
            "tons2024" -> compareBy<Map<String, Any?>> { (it["value_tons_2024"] as? BigDecimal) ?: BigDecimal.ZERO }
            "country" -> compareBy<Map<String, Any?>> { (it["country"] as? String) ?: "" }
            else -> null
        }
        val sorted = if (comparator != null) {
            val s = mapped.sortedWith(comparator)
            if (order.equals("asc", true)) s else s.reversed()
        } else mapped

        return sorted
    }

    private fun WideParfumeEntity.toDto() = WideRowDto(
        country, valueUsdMln2022, valueUsdMln2023, valueUsdMln2024, valueTons2022, valueTons2023, valueTons2024
    )
    private fun WideElevatorsEntity.toDto() = WideRowDto(
        country, valueUsdMln2022, valueUsdMln2023, valueUsdMln2024, valueTons2022, valueTons2023, valueTons2024
    )
    private fun WideBankomatsEntity.toDto() = WideRowDto(
        country, valueUsdMln2022, valueUsdMln2023, valueUsdMln2024, valueTons2022, valueTons2023, valueTons2024
    )
}

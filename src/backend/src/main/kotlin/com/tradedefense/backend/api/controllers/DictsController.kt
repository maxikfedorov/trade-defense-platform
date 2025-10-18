package com.tradedefense.backend.api.controllers

import com.tradedefense.backend.api.dto.dicts.TariffDto
import com.tradedefense.backend.api.dto.dicts.TariffPageDto
import com.tradedefense.backend.infra.db.pg.entities.TariffEntity
import com.tradedefense.backend.infra.db.pg.repositories.TariffRepository
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/tariffs")
class DictsController(
    private val tariffRepo: TariffRepository
) {

    // Получить запись по коду
    @GetMapping("/{code}")
    fun getByCode(@PathVariable code: String): TariffDto? =
        tariffRepo.findById(code.trim()).map { it.toDto() }.orElse(null)

    // Поиск по префиксу кода (пагинация)
    @GetMapping
    fun find(
        @RequestParam(required = false) codePrefix: String?,
        @RequestParam(required = false) q: String?,           // поиск по имени
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): TariffPageDto {
        val pageable = PageRequest.of(page.coerceAtLeast(0), size.coerceIn(1, 200))
        val pageRes = when {
            !codePrefix.isNullOrBlank() -> tariffRepo.findByCodePrefix(codePrefix.trim(), pageable)
            !q.isNullOrBlank() -> tariffRepo.searchByName(q.trim(), pageable)
            else -> tariffRepo.findAll(pageable)
        }
        return TariffPageDto(
            items = pageRes.content.map { it.toDto() },
            total = pageRes.totalElements,
            page = pageRes.number,
            size = pageRes.size
        )
    }

    // Обновить тарифную запись (простая правка описания/ставки)
    @PutMapping("/{code}")
    fun update(
        @PathVariable code: String,
        @RequestBody body: TariffDto
    ): TariffDto {
        val entity = tariffRepo.findById(code).orElse(TariffEntity(code = code))
        entity.name = body.name
        entity.tariffPercent = body.tariffPercent
        entity.details = body.details
        return tariffRepo.save(entity).toDto()
    }

    private fun TariffEntity.toDto() = TariffDto(
        code = this.code,
        name = this.name,
        tariffPercent = this.tariffPercent,
        details = this.details
    )
}

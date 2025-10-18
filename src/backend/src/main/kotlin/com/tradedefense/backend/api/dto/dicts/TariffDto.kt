package com.tradedefense.backend.api.dto.dicts

import java.math.BigDecimal

data class TariffDto(
    val code: String,
    val name: String,
    val tariffPercent: BigDecimal?,
    val details: String?
)

data class TariffPageDto(
    val items: List<TariffDto>,
    val total: Long,
    val page: Int,
    val size: Int
)

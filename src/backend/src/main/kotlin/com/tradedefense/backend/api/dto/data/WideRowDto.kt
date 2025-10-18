package com.tradedefense.backend.api.dto.data

import java.math.BigDecimal

data class WideRowDto(
    val country: String,
    val valueUsdMln2022: BigDecimal?,
    val valueUsdMln2023: BigDecimal?,
    val valueUsdMln2024: BigDecimal?,
    val valueTons2022: BigDecimal?,
    val valueTons2023: BigDecimal?,
    val valueTons2024: BigDecimal?
)

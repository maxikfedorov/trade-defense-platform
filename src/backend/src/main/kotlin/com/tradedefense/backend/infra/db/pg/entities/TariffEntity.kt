package com.tradedefense.backend.infra.db.pg.entities

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "tariffs", schema = "public")
class TariffEntity(
    @Id
    @Column(name = "code", length = 32)
    var code: String = "",

    @Column(name = "name")
    var name: String = "",

    @Column(name = "tariff_percent", precision = 6, scale = 2)
    var tariffPercent: BigDecimal? = null,

    @Column(name = "details")
    var details: String? = null
)

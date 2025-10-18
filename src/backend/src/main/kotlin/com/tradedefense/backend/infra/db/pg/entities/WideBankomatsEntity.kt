package com.tradedefense.backend.infra.db.pg.entities

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "bankomats", schema = "public")
class WideBankomatsEntity(
    @Id
    @Column(name = "country", length = 128)
    var country: String = "",

    @Column(name = "value_usd_mln_2022", precision = 18, scale = 3)
    var valueUsdMln2022: BigDecimal? = null,
    @Column(name = "value_usd_mln_2023", precision = 18, scale = 3)
    var valueUsdMln2023: BigDecimal? = null,
    @Column(name = "value_usd_mln_2024", precision = 18, scale = 3)
    var valueUsdMln2024: BigDecimal? = null,

    @Column(name = "value_tons_2022", precision = 18, scale = 3)
    var valueTons2022: BigDecimal? = null,
    @Column(name = "value_tons_2023", precision = 18, scale = 3)
    var valueTons2023: BigDecimal? = null,
    @Column(name = "value_tons_2024", precision = 18, scale = 3)
    var valueTons2024: BigDecimal? = null
)

package com.tradedefense.backend.infra.db.pg.repositories

import com.tradedefense.backend.infra.db.pg.entities.WideBankomatsEntity
import com.tradedefense.backend.infra.db.pg.entities.WideParfumeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface WideBankomatsRepository : JpaRepository<WideBankomatsEntity, String> {

    @Query("select b from WideBankomatsEntity b order by b.country")
    fun findAllPlain(): List<WideBankomatsEntity>

    @Query("select b from WideBankomatsEntity b where b.country like :pattern order by b.country")
    fun findByPattern(@Param("pattern") pattern: String): List<WideBankomatsEntity>
}

package com.tradedefense.backend.infra.db.pg.repositories

import com.tradedefense.backend.infra.db.pg.entities.WideParfumeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface WideParfumeRepository : JpaRepository<WideParfumeEntity, String> {

    @Query("select p from WideParfumeEntity p order by p.country")
    fun findAllPlain(): List<WideParfumeEntity>

    @Query("select p from WideParfumeEntity p where p.country like :pattern order by p.country")
    fun findByPattern(@Param("pattern") pattern: String): List<WideParfumeEntity>
}


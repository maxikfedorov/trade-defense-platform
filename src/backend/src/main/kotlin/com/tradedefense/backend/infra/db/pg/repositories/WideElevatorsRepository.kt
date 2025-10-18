package com.tradedefense.backend.infra.db.pg.repositories

import com.tradedefense.backend.infra.db.pg.entities.WideElevatorsEntity
import com.tradedefense.backend.infra.db.pg.entities.WideParfumeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface WideElevatorsRepository : JpaRepository<WideElevatorsEntity, String> {

    @Query("select e from WideElevatorsEntity e order by e.country")
    fun findAllPlain(): List<WideElevatorsEntity>

    @Query("select e from WideElevatorsEntity e where e.country like :pattern order by e.country")
    fun findByPattern(@Param("pattern") pattern: String): List<WideElevatorsEntity>
}

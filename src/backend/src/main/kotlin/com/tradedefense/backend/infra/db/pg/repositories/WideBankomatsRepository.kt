package com.tradedefense.backend.infra.db.pg.repositories

import com.tradedefense.backend.infra.db.pg.entities.WideBankomatsEntity
import com.tradedefense.backend.infra.db.pg.entities.WideParfumeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface WideBankomatsRepository : JpaRepository<WideBankomatsEntity, String> {

    @Query("select p from WideBankomatsEntity p where (:q is null or lower(p.country) like lower(concat('%', :q, '%'))) order by p.country")
    fun findAllFiltered(q: String?): List<WideBankomatsEntity>
}

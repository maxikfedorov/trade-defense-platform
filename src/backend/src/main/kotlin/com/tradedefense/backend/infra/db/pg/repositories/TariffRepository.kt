package com.tradedefense.backend.infra.db.pg.repositories

import com.tradedefense.backend.infra.db.pg.entities.TariffEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface TariffRepository : JpaRepository<TariffEntity, String> {

    @Query("""
       select t from TariffEntity t 
       where t.code like concat(?1, '%')
       order by t.code
    """)
    fun findByCodePrefix(prefix: String, pageable: Pageable): Page<TariffEntity>

    @Query("""
       select t from TariffEntity t 
       where lower(t.name) like lower(concat('%', ?1, '%'))
       order by t.name
    """)
    fun searchByName(q: String, pageable: Pageable): Page<TariffEntity>
}

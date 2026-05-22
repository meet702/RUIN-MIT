package com.RuinMIT.repository;

import com.RuinMIT.entity.ItemCondition;
import com.RuinMIT.entity.MarketplaceCategory;
import com.RuinMIT.entity.MarketplaceListing;
import com.RuinMIT.entity.MarketplaceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MarketplaceListingRepository extends JpaRepository<MarketplaceListing, UUID> {

    @Query("SELECT m FROM MarketplaceListing m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:category IS NULL OR m.category = :category) AND " +
           "(:condition IS NULL OR m.condition = :condition)")
    Page<MarketplaceListing> findByFilters(
            @Param("status") MarketplaceStatus status,
            @Param("category") MarketplaceCategory category,
            @Param("condition") ItemCondition condition,
            Pageable pageable);
}

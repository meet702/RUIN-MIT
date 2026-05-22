package com.RuinMIT.repository;

import com.RuinMIT.entity.LostAndFound;
import com.RuinMIT.entity.LostFoundStatus;
import com.RuinMIT.entity.LostFoundType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LostAndFoundRepository extends JpaRepository<LostAndFound, UUID> {

    @Query("SELECT l FROM LostAndFound l WHERE " +
           "(:type IS NULL OR l.type = :type) AND " +
           "(:status IS NULL OR l.status = :status)")
    Page<LostAndFound> findByTypeAndStatus(@Param("type") LostFoundType type,
                                           @Param("status") LostFoundStatus status,
                                           Pageable pageable);
}

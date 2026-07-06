package com.RuinMIT.repository;

import com.RuinMIT.entity.LostFoundImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LostFoundImageRepository extends JpaRepository<LostFoundImage, UUID> {
}

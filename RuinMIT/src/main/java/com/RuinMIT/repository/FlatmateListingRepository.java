package com.RuinMIT.repository;

import com.RuinMIT.entity.FlatmateListing;
import com.RuinMIT.entity.GenderPreference;
import com.RuinMIT.entity.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FlatmateListingRepository extends JpaRepository<FlatmateListing, UUID> {

    Page<FlatmateListing> findByStatus(ListingStatus status, Pageable pageable);

    Page<FlatmateListing> findByStatusAndGenderPreference(ListingStatus status, GenderPreference genderPreference, Pageable pageable);
}

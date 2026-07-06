package com.RuinMIT.repository;

import com.RuinMIT.entity.FlatmateInquiry;
import com.RuinMIT.entity.FlatmateListing;
import com.RuinMIT.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlatmateInquiryRepository extends JpaRepository<FlatmateInquiry, UUID> {

    boolean existsByListingAndSender(FlatmateListing listing, User sender);

    List<FlatmateInquiry> findByListing(FlatmateListing listing);

    List<FlatmateInquiry> findByListingId(UUID listingId);
}

package com.RuinMIT.repository;

import com.RuinMIT.entity.MarketplaceInquiry;
import com.RuinMIT.entity.MarketplaceListing;
import com.RuinMIT.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketplaceInquiryRepository extends JpaRepository<MarketplaceInquiry, UUID> {

    boolean existsByListingAndSender(MarketplaceListing listing, User sender);

    List<MarketplaceInquiry> findByListing(MarketplaceListing listing);
}

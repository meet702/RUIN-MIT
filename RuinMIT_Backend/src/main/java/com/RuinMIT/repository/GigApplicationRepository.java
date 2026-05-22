package com.RuinMIT.repository;

import com.RuinMIT.entity.Gig;
import com.RuinMIT.entity.GigApplication;
import com.RuinMIT.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GigApplicationRepository extends JpaRepository<GigApplication, UUID> {
    boolean existsByGigAndApplicant(Gig gig, User applicant);
    List<GigApplication> findByGig(Gig gig);
}

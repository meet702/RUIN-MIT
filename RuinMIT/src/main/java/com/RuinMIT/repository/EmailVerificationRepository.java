package com.RuinMIT.repository;

import com.RuinMIT.entity.EmailVerification;
import com.RuinMIT.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    Optional<EmailVerification> findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(User user);

    @Modifying
    @Query("UPDATE EmailVerification ev SET ev.isUsed = true WHERE ev.user = :user AND ev.isUsed = false")
    void invalidateAllOtpsForUser(@Param("user") User user);
}

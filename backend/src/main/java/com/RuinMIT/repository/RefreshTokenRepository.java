package com.RuinMIT.repository;

import com.RuinMIT.entity.RefreshToken;
import com.RuinMIT.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true WHERE rt.user = :user AND rt.isRevoked = false")
    void revokeAllActiveTokensForUser(@Param("user") User user);
}

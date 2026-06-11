package com.RuinMIT.repository;

import com.RuinMIT.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    Optional<Conversation> findByParticipantOneIdAndParticipantTwoIdAndReferenceId(UUID p1, UUID p2, UUID refId);

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.participantOne.id = :userId OR c.participantTwo.id = :userId
            ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC
            """)
    List<Conversation> findAllForUserOrderByRecent(@Param("userId") UUID userId);

    @Query("""
            SELECT c FROM Conversation c WHERE
            ((c.participantOne.id = :userId1 AND c.participantTwo.id = :userId2)
            OR (c.participantOne.id = :userId2 AND c.participantTwo.id = :userId1))
            AND c.referenceId = :referenceId
            """)
    Optional<Conversation> findByParticipantsAndReferenceIdAnyOrder(
            @Param("userId1") UUID userId1,
            @Param("userId2") UUID userId2,
            @Param("referenceId") UUID referenceId);
}

package com.RuinMIT.repository;

import com.RuinMIT.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    long countByConversationIdAndIsReadFalseAndSenderIdNot(UUID conversationId, UUID senderId);

    @Query("""
            SELECT m.conversation.id, COUNT(m)
            FROM Message m
            WHERE m.conversation.id IN :conversationIds
            AND m.sender.id <> :senderId
            AND m.isRead = false
            GROUP BY m.conversation.id
            """)
    List<Object[]> countUnreadByConversationIdsAndSenderIdNot(
            @Param("conversationIds") List<UUID> conversationIds,
            @Param("senderId") UUID senderId);

    @Modifying
    @Query("""
            UPDATE Message m
            SET m.isRead = true
            WHERE m.conversation.id = :conversationId
            AND m.sender.id <> :currentUserId
            AND m.isRead = false
            """)
    int markConversationMessagesRead(
            @Param("conversationId") UUID conversationId,
            @Param("currentUserId") UUID currentUserId);
}

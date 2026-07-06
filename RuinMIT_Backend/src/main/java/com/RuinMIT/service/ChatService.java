package com.RuinMIT.service;

import com.RuinMIT.dto.chat.ConversationResponse;
import com.RuinMIT.dto.chat.MessageResponse;
import com.RuinMIT.entity.Conversation;
import com.RuinMIT.entity.Message;
import com.RuinMIT.entity.User;
import com.RuinMIT.exception.BadRequestException;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final GigRepository gigRepository;
    private final RideRepository rideRepository;
    private final MarketplaceListingRepository marketplaceListingRepository;
    private final FlatmateListingRepository flatmateListingRepository;
    private final LostAndFoundRepository lostAndFoundRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Transactional
    public ConversationResponse getOrCreateConversation(UUID currentUserId, UUID otherUserId, String referenceType, UUID referenceId) {
        if (currentUserId.equals(otherUserId)) {
            throw new BadRequestException("Cannot start a conversation with yourself");
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Other user not found"));

        Conversation conversation = conversationRepository
                .findByParticipantsAndReferenceIdAnyOrder(currentUserId, otherUserId, referenceId)
                .orElseGet(() -> conversationRepository.save(buildConversation(currentUser, otherUser, referenceType, referenceId)));

        return mapToConversationResponse(conversation, currentUser);
    }

    public List<ConversationResponse> getConversations(String userEmail) {
        User currentUser = findUserByEmail(userEmail);
        List<Conversation> conversations = conversationRepository.findAllForUserOrderByRecent(currentUser.getId());
        
        if (conversations.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> conversationIds = conversations.stream().map(Conversation::getId).toList();

        // Batch fetch unread counts
        List<Object[]> unreadCountsData = messageRepository.countUnreadByConversationIdsAndSenderIdNot(conversationIds, currentUser.getId());
        Map<UUID, Long> unreadCounts = new HashMap<>();
        for (Object[] row : unreadCountsData) {
            unreadCounts.put((UUID) row[0], (Long) row[1]);
        }

        // Batch fetch reference titles
        Map<String, List<UUID>> refsByType = conversations.stream()
                .filter(c -> c.getReferenceType() != null && c.getReferenceId() != null)
                .collect(Collectors.groupingBy(Conversation::getReferenceType,
                        Collectors.mapping(Conversation::getReferenceId, Collectors.toList())));

        Map<UUID, String> referenceTitles = new HashMap<>();
        
        for (Map.Entry<String, List<UUID>> entry : refsByType.entrySet()) {
            String type = entry.getKey();
            List<UUID> ids = entry.getValue();
            
            switch (type) {
                case "gig" -> gigRepository.findAllById(ids).forEach(gig -> referenceTitles.put(gig.getId(), gig.getTitle() + " gig"));
                case "ride" -> rideRepository.findAllById(ids).forEach(ride -> referenceTitles.put(ride.getId(), ride.getFromLocation() + " to " + ride.getToLocation()));
                case "marketplace" -> marketplaceListingRepository.findAllById(ids).forEach(listing -> referenceTitles.put(listing.getId(), listing.getTitle() + " listing"));
                case "flatmate" -> flatmateListingRepository.findAllById(ids).forEach(listing -> referenceTitles.put(listing.getId(), listing.getTitle() + " listing"));
                case "lost_found" -> lostAndFoundRepository.findAllById(ids).forEach(post -> referenceTitles.put(post.getId(), post.getTitle() + " post"));
            }
        }

        return conversations.stream()
                .map(conversation -> mapToConversationResponse(
                        conversation, 
                        currentUser, 
                        unreadCounts.getOrDefault(conversation.getId(), 0L), 
                        referenceTitles.get(conversation.getReferenceId())))
                .toList();
    }

    @Transactional
    public List<MessageResponse> getChatHistory(UUID conversationId, String userEmail) {
        User currentUser = findUserByEmail(userEmail);
        Conversation conversation = getConversationForParticipant(conversationId, currentUser);
        messageRepository.markConversationMessagesRead(conversation.getId(), currentUser.getId());
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::mapToMessageResponse)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(UUID conversationId, String content, String userEmail) {
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Message content cannot be empty");
        }

        User sender = findUserByEmail(userEmail);
        Conversation conversation = getConversationForParticipant(conversationId, sender);

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content.trim())
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        conversation.setLastMessage(savedMessage.getContent());
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageResponse response = mapToMessageResponse(savedMessage);
        messagingTemplate.convertAndSend("/queue/conversation/" + conversationId, response);
        notifyRecipient(conversation, sender, savedMessage);
        return response;
    }

    private void notifyRecipient(Conversation conversation, User sender, Message message) {
        User recipient = conversation.getParticipantOne().getId().equals(sender.getId())
                ? conversation.getParticipantTwo()
                : conversation.getParticipantOne();

        String preview = message.getContent();
        if (preview.length() > 80) {
            preview = preview.substring(0, 77) + "...";
        }

        notificationService.createNotification(
                recipient.getId(),
                "New message from " + sender.getFullName(),
                preview,
                "chat_message",
                conversation.getId());
    }

    private Conversation buildConversation(User currentUser, User otherUser, String referenceType, UUID referenceId) {
        return Conversation.builder()
                .participantOne(currentUser)
                .participantTwo(otherUser)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
    }

    private User findUserByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Conversation getConversationForParticipant(UUID conversationId, User user) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getParticipantOne().getId().equals(user.getId())
                && !conversation.getParticipantTwo().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }

        return conversation;
    }

    private ConversationResponse mapToConversationResponse(Conversation conversation, User currentUser) {
        long unreadCount = messageRepository.countByConversationIdAndIsReadFalseAndSenderIdNot(
                conversation.getId(),
                currentUser.getId());
        String refTitle = resolveReferenceTitle(conversation.getReferenceType(), conversation.getReferenceId());
        
        return mapToConversationResponse(conversation, currentUser, unreadCount, refTitle);
    }

    private ConversationResponse mapToConversationResponse(Conversation conversation, User currentUser, long unreadCount, String referenceTitle) {
        User otherUser = conversation.getParticipantOne().getId().equals(currentUser.getId())
                ? conversation.getParticipantTwo()
                : conversation.getParticipantOne();

        return ConversationResponse.builder()
                .id(conversation.getId())
                .conversationId(conversation.getId())
                .otherUserId(otherUser.getId())
                .otherUserName(otherUser.getFullName())
                .otherParticipant(ConversationResponse.ParticipantResponse.builder()
                        .id(otherUser.getId())
                        .name(otherUser.getFullName())
                        .build())
                .referenceType(conversation.getReferenceType())
                .referenceId(conversation.getReferenceId())
                .referenceTitle(referenceTitle != null ? referenceTitle : conversation.getReferenceType())
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .createdAt(conversation.getCreatedAt())
                .unreadCount(unreadCount)
                .build();
    }

    private MessageResponse mapToMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private String resolveReferenceTitle(String referenceType, UUID referenceId) {
        if (referenceType == null || referenceId == null) {
            return null;
        }

        return switch (referenceType) {
            case "gig" -> gigRepository.findById(referenceId).map(gig -> gig.getTitle() + " gig").orElse("Gig");
            case "ride" -> rideRepository.findById(referenceId)
                    .map(ride -> ride.getFromLocation() + " to " + ride.getToLocation())
                    .orElse("Ride");
            case "marketplace" -> marketplaceListingRepository.findById(referenceId)
                    .map(listing -> listing.getTitle() + " listing")
                    .orElse("Marketplace listing");
            case "flatmate" -> flatmateListingRepository.findById(referenceId)
                    .map(listing -> listing.getTitle() + " listing")
                    .orElse("Flatmate listing");
            case "lost_found" -> lostAndFoundRepository.findById(referenceId)
                    .map(post -> post.getTitle() + " post")
                    .orElse("Lost & Found post");
            default -> referenceType;
        };
    }
}

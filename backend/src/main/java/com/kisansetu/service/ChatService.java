package com.kisansetu.service;

import com.kisansetu.dto.ConversationResponse;
import com.kisansetu.dto.MessageResponse;
import com.kisansetu.dto.SendMessageRequest;
import com.kisansetu.entity.Conversation;
import com.kisansetu.entity.CropListing;
import com.kisansetu.entity.Message;
import com.kisansetu.entity.User;
import com.kisansetu.exception.ResourceNotFoundException;
import com.kisansetu.exception.UnauthorizedOperationException;
import com.kisansetu.repository.ConversationRepository;
import com.kisansetu.repository.CropListingRepository;
import com.kisansetu.repository.MessageRepository;
import com.kisansetu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CropListingRepository cropListingRepository;

    public ChatService(ConversationRepository conversationRepository,
                       MessageRepository messageRepository,
                       UserRepository userRepository,
                       CropListingRepository cropListingRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.cropListingRepository = cropListingRepository;
    }

    @Transactional
    public ConversationResponse getOrCreateConversation(User user, Long targetUserId, Long listingId) {
        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Target user not found with ID: " + targetUserId));

        User buyer = user.getRole() == com.kisansetu.entity.Role.FARMER ? targetUser : user;
        User farmer = user.getRole() == com.kisansetu.entity.Role.FARMER ? user : targetUser;

        var existing = conversationRepository.findExistingConversation(buyer.getId(), farmer.getId(), listingId);
        if (existing.isPresent()) {
            return ConversationResponse.fromEntity(existing.get());
        }

        CropListing listing = listingId != null ? cropListingRepository.findById(listingId).orElse(null) : null;

        Conversation conv = new Conversation();
        conv.setBuyer(buyer);
        conv.setFarmer(farmer);
        conv.setListing(listing);
        conv = conversationRepository.save(conv);

        return ConversationResponse.fromEntity(conv);
    }

    public List<ConversationResponse> getUserConversations(User user) {
        return conversationRepository.findUserConversations(user.getId())
            .stream().map(ConversationResponse::fromEntity).toList();
    }

    @Transactional
    public MessageResponse sendMessage(User sender, SendMessageRequest request) {
        Conversation conv = conversationRepository.findById(request.conversationId())
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + request.conversationId()));

        if (!conv.getBuyer().getId().equals(sender.getId()) && !conv.getFarmer().getId().equals(sender.getId())) {
            throw new UnauthorizedOperationException("You are not a participant in this conversation.");
        }

        Message msg = new Message(conv, sender, request.content());
        msg.setOriginalLanguage(sender.getPreferredLanguage());

        // Simple mock translator tag if target language differs (clearly labeled as machine translated)
        if (request.targetLanguage() != null && !request.targetLanguage().equalsIgnoreCase(sender.getPreferredLanguage())) {
            msg.setTranslatedContent("[Auto-translated to " + request.targetLanguage() + "]: " + request.content());
            msg.setMachineTranslated(true);
        }

        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        msg = messageRepository.save(msg);
        return MessageResponse.fromEntity(msg);
    }

    public List<MessageResponse> getMessages(User user, Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with ID: " + conversationId));

        if (!conv.getBuyer().getId().equals(user.getId()) && !conv.getFarmer().getId().equals(user.getId())) {
            throw new UnauthorizedOperationException("You are not authorized to view messages in this conversation.");
        }

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
            .stream().map(MessageResponse::fromEntity).toList();
    }
}

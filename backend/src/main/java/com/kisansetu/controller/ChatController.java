package com.kisansetu.controller;

import com.kisansetu.dto.ConversationResponse;
import com.kisansetu.dto.MessageResponse;
import com.kisansetu.dto.SendMessageRequest;
import com.kisansetu.entity.User;
import com.kisansetu.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getUserConversations(user));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> getOrCreateConversation(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Long> body) {
        Long targetUserId = body.get("targetUserId");
        Long listingId = body.get("listingId");
        return ResponseEntity.ok(chatService.getOrCreateConversation(user, targetUserId, listingId));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatService.getMessages(user, id));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(user, request));
    }
}

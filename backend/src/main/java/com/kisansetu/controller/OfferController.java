package com.kisansetu.controller;

import com.kisansetu.dto.CounterOfferRequest;
import com.kisansetu.dto.OfferCreateRequest;
import com.kisansetu.dto.OfferResponse;
import com.kisansetu.entity.User;
import com.kisansetu.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping
    public ResponseEntity<OfferResponse> createOffer(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OfferCreateRequest request) {
        return ResponseEntity.ok(offerService.createOffer(user, request));
    }

    @PostMapping("/{id}/counter")
    public ResponseEntity<OfferResponse> counterOffer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody CounterOfferRequest request) {
        return ResponseEntity.ok(offerService.counterOffer(user, id, request));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<OfferResponse> acceptOffer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(offerService.acceptOffer(user, id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<OfferResponse> rejectOffer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(offerService.rejectOffer(user, id));
    }

    @GetMapping("/buyer")
    public ResponseEntity<List<OfferResponse>> getBuyerOffers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.getBuyerOffers(user.getId()));
    }

    @GetMapping("/farmer")
    public ResponseEntity<List<OfferResponse>> getFarmerOffers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.getFarmerOffers(user.getId()));
    }
}

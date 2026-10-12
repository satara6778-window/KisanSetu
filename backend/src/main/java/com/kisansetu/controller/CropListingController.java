package com.kisansetu.controller;

import com.kisansetu.dto.ListingCreateRequest;
import com.kisansetu.dto.ListingResponse;
import com.kisansetu.entity.ListingStatus;
import com.kisansetu.entity.User;
import com.kisansetu.service.CropListingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class CropListingController {

    private final CropListingService cropListingService;

    public CropListingController(CropListingService cropListingService) {
        this.cropListingService = cropListingService;
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getListings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String grade) {

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(cropListingService.searchListings(search));
        }

        if (category != null || minPrice != null || maxPrice != null || grade != null) {
            return ResponseEntity.ok(cropListingService.filterListings(category, minPrice, maxPrice, grade));
        }

        return ResponseEntity.ok(cropListingService.getActiveListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(cropListingService.getListingById(id));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<ListingResponse>> getFarmerListings(@PathVariable Long farmerId) {
        return ResponseEntity.ok(cropListingService.getFarmerListings(farmerId));
    }

    @PostMapping
    public ResponseEntity<ListingResponse> createListing(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ListingCreateRequest request) {
        return ResponseEntity.ok(cropListingService.createListing(user, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ListingCreateRequest request) {
        return ResponseEntity.ok(cropListingService.updateListing(user, id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponse> updateStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        ListingStatus status = ListingStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(cropListingService.updateStatus(user, id, status));
    }
}

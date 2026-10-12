package com.kisansetu.controller;

import com.kisansetu.dto.ReviewCreateRequest;
import com.kisansetu.dto.ReviewResponse;
import com.kisansetu.entity.User;
import com.kisansetu.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(reviewService.createReview(user, request));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<ReviewResponse>> getFarmerReviews(@PathVariable Long farmerId) {
        return ResponseEntity.ok(reviewService.getFarmerReviews(farmerId));
    }
}

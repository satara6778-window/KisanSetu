package com.kisansetu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class FarmerProfileController {

    private final Map<String, Map<String, Object>> profileStore = new HashMap<>();

    public FarmerProfileController() {
        // Seed default profile for default_farmer / ramesh patil
        Map<String, Object> defaultProfile = new HashMap<>();
        defaultProfile.put("location", "Manchar, Pune, Maharashtra");
        defaultProfile.put("soil_npk", Map.of("N", 45, "P", 30, "K", 40));
        defaultProfile.put("soil_ph", 6.8);
        defaultProfile.put("soil_texture", "Medium Black Loam");
        defaultProfile.put("crops", List.of("Tomato", "Nashik Red Onion", "Bhagwa Pomegranate", "Organic Green Chillies"));
        defaultProfile.put("farming_history", List.of());
        defaultProfile.put("previous_diseases", List.of());
        defaultProfile.put("previous_recommendations", List.of(
            "Maintain drip irrigation schedule during flowering stage.",
            "Apply neem cake soil enrichment for root health before transplanting."
        ));
        defaultProfile.put("preferred_language", "English");
        defaultProfile.put("irrigation_method", "Drip Irrigation");

        profileStore.put("default_farmer", defaultProfile);
        profileStore.put("9876543210", defaultProfile);
    }

    @GetMapping("/api/profile/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable String userId) {
        Map<String, Object> profile = profileStore.getOrDefault(userId, profileStore.get("default_farmer"));
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/api/profile/{userId}")
    public ResponseEntity<Map<String, Object>> saveProfile(
            @PathVariable String userId,
            @RequestBody Map<String, Object> updatedProfile) {
        profileStore.put(userId, updatedProfile);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Farm profile saved successfully"));
    }

    @GetMapping("/api/history/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@PathVariable String userId) {
        return ResponseEntity.ok(List.of());
    }

    @DeleteMapping("/api/history/{userId}")
    public ResponseEntity<Map<String, String>> clearHistory(@PathVariable String userId) {
        return ResponseEntity.ok(Map.of("status", "success", "message", "History cleared"));
    }

    @PostMapping("/api/proactive_alerts/{userId}")
    public ResponseEntity<Map<String, Object>> getProactiveAlerts(@PathVariable String userId) {
        String alertText = "⚠️ Weather Advisory: Scattered rainfall expected across Pune & Nashik divisions over the next 48 hours. Ensure harvested crops are sheltered.\n\n" +
                "🚨 APMC Mandi Trend: Lasalgaon Red Onion arrivals are steady; benchmark modal rate holding at ₹1,850/Quintal.";
        return ResponseEntity.ok(Map.of(
            "user_id", userId,
            "alerts", alertText
        ));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, String>> submitFeedback(@RequestBody Map<String, Object> feedback) {
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @PostMapping("/apps/app/users/{userId}/sessions")
    public ResponseEntity<Map<String, Object>> createSession(@PathVariable String userId) {
        String sessionId = "session_" + System.currentTimeMillis();
        return ResponseEntity.ok(Map.of(
            "id", sessionId,
            "user_id", userId,
            "created_at", new Date().toString()
        ));
    }
}

package com.kisansetu.controller;

import com.kisansetu.config.PlatformConfig;
import com.kisansetu.dto.ComplaintResolveRequest;
import com.kisansetu.dto.ComplaintResponse;
import com.kisansetu.entity.AuditLog;
import com.kisansetu.entity.User;
import com.kisansetu.repository.CropListingRepository;
import com.kisansetu.repository.OrderRepository;
import com.kisansetu.repository.UserRepository;
import com.kisansetu.service.AuditService;
import com.kisansetu.service.ComplaintService;
import com.kisansetu.service.MarketPriceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ComplaintService complaintService;
    private final MarketPriceService marketPriceService;
    private final PlatformConfig platformConfig;
    private final AuditService auditService;
    private final UserRepository userRepository;
    private final CropListingRepository cropListingRepository;
    private final OrderRepository orderRepository;

    public AdminController(ComplaintService complaintService,
                           MarketPriceService marketPriceService,
                           PlatformConfig platformConfig,
                           AuditService auditService,
                           UserRepository userRepository,
                           CropListingRepository cropListingRepository,
                           OrderRepository orderRepository) {
        this.complaintService = complaintService;
        this.marketPriceService = marketPriceService;
        this.platformConfig = platformConfig;
        this.auditService = auditService;
        this.userRepository = userRepository;
        this.cropListingRepository = cropListingRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalListings", cropListingRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("platformFeePercentage", platformConfig.getPlatformFeePercentage());
        stats.put("pendingComplaints", complaintService.getAllComplaints().stream()
                .filter(c -> c.status() == com.kisansetu.entity.ComplaintStatus.OPEN).count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PatchMapping("/complaints/{id}/resolve")
    public ResponseEntity<ComplaintResponse> resolveComplaint(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ComplaintResolveRequest request) {
        return ResponseEntity.ok(complaintService.resolveComplaint(user, id, request));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getRecentLogs());
    }

    @PostMapping("/platform-fee")
    public ResponseEntity<Map<String, Object>> updatePlatformFee(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Double> body) {
        Double fee = body.get("feePercentage");
        if (fee != null && fee >= 0) {
            platformConfig.setPlatformFeePercentage(BigDecimal.valueOf(fee));
            auditService.log("FEE_UPDATED", user.getPhone(), "PlatformConfig", "FEE", "Updated fee to " + fee + "%");
        }
        return ResponseEntity.ok(Map.of("platformFeePercentage", platformConfig.getPlatformFeePercentage()));
    }

    @PostMapping("/market-prices/import-csv")
    public ResponseEntity<Map<String, Object>> importMarketPrices(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        try {
            int imported = marketPriceService.importCsv(file, user.getPhone());
            return ResponseEntity.ok(Map.of("importedCount", imported, "message", "CSV imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "CSV import failed: " + e.getMessage()));
        }
    }
}

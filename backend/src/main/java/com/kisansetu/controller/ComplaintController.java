package com.kisansetu.controller;

import com.kisansetu.dto.ComplaintCreateRequest;
import com.kisansetu.dto.ComplaintResponse;
import com.kisansetu.entity.User;
import com.kisansetu.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ComplaintCreateRequest request) {
        return ResponseEntity.ok(complaintService.createComplaint(user, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getUserComplaints(user.getId()));
    }
}

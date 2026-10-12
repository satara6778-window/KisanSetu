package com.kisansetu.controller;

import com.kisansetu.dto.PriceExplanationRequest;
import com.kisansetu.dto.PriceExplanationResponse;
import com.kisansetu.service.AiAdvisoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiAdvisoryController {

    private final AiAdvisoryService aiAdvisoryService;

    public AiAdvisoryController(AiAdvisoryService aiAdvisoryService) {
        this.aiAdvisoryService = aiAdvisoryService;
    }

    @PostMapping("/explain-price")
    public ResponseEntity<PriceExplanationResponse> explainPrice(@RequestBody PriceExplanationRequest request) {
        return ResponseEntity.ok(aiAdvisoryService.explainPrice(request));
    }
}

package com.kisansetu.controller;

import com.kisansetu.dto.MarketPriceResponse;
import com.kisansetu.service.MarketPriceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market-prices")
public class MarketPriceController {

    private final MarketPriceService marketPriceService;

    public MarketPriceController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping
    public ResponseEntity<List<MarketPriceResponse>> getLatestPrices(
            @RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(marketPriceService.searchPrices(search));
        }
        return ResponseEntity.ok(marketPriceService.getLatestPrices());
    }

    @GetMapping("/crop/{cropName}")
    public ResponseEntity<List<MarketPriceResponse>> getPricesForCrop(@PathVariable String cropName) {
        return ResponseEntity.ok(marketPriceService.getPricesForCrop(cropName));
    }

    @GetMapping("/crops")
    public ResponseEntity<List<String>> getAvailableCrops() {
        return ResponseEntity.ok(marketPriceService.getAvailableCrops());
    }
}

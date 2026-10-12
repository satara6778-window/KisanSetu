package com.kisansetu.service;

import com.kisansetu.dto.PriceExplanationRequest;
import com.kisansetu.dto.PriceExplanationResponse;
import com.kisansetu.entity.MarketPriceRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class AiAdvisoryService {

    private final MarketPriceService marketPriceService;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public AiAdvisoryService(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    public PriceExplanationResponse explainPrice(PriceExplanationRequest request) {
        Optional<MarketPriceRecord> recordOpt = marketPriceService.getLatestPriceRecord(request.cropName());

        if (recordOpt.isEmpty()) {
            return new PriceExplanationResponse(
                request.cropName(),
                null, null, null, "kg", "N/A", null, "None",
                "Verified market price is currently unavailable for " + request.cropName() + ". No past mandi records found in verified storage.",
                "Market prices are never invented by AI. Data must be ingested from verified APMC sources."
            );
        }

        MarketPriceRecord record = recordOpt.get();

        // Build deterministic, factual analysis based strictly on stored records
        StringBuilder analysis = new StringBuilder();
        analysis.append("According to verified data from ").append(record.getSourceName())
                .append(" for ").append(record.getMarketName()).append(" (observed on ").append(record.getObservationDate()).append("):\n");
        analysis.append("• Modal mandi price: ₹").append(record.getModalPrice()).append(" per ").append(record.getUnit()).append(".\n");
        analysis.append("• Observed range: ₹").append(record.getMinPrice()).append(" to ₹").append(record.getMaxPrice()).append(" per ").append(record.getUnit()).append(".\n");

        if (request.currentFarmerPrice() != null) {
            BigDecimal diff = request.currentFarmerPrice().subtract(record.getModalPrice());
            BigDecimal pct = diff.multiply(BigDecimal.valueOf(100)).divide(record.getModalPrice(), 1, RoundingMode.HALF_UP);
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                analysis.append("• Your price is ₹").append(diff.abs()).append(" (").append(pct.abs()).append("%) higher than the latest mandi modal rate. ");
                analysis.append("Ensure your quality grade (e.g. Grade A or Organic) justifies this premium to attract direct buyers.\n");
            } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
                analysis.append("• Your price is ₹").append(diff.abs()).append(" (").append(pct.abs()).append("%) below the mandi modal rate. ");
                analysis.append("This is highly competitive for rapid direct sales without middleman deductions.\n");
            } else {
                analysis.append("• Your price directly matches the prevailing mandi modal price.\n");
            }
        }

        if (request.transportCostPerUnit() != null && request.transportCostPerUnit().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal netMandi = record.getModalPrice().subtract(request.transportCostPerUnit());
            analysis.append("• Deducting your specified transport cost (₹").append(request.transportCostPerUnit())
                    .append("/").append(record.getUnit()).append("), your net mandi realization is approx ₹")
                    .append(netMandi).append(" per ").append(record.getUnit()).append(".\n");
            analysis.append("• Direct farmgate selling on KisanSetu eliminates this freight deduction.\n");
        }

        return new PriceExplanationResponse(
            record.getCropName(),
            record.getModalPrice(),
            record.getMinPrice(),
            record.getMaxPrice(),
            record.getUnit(),
            record.getMarketName(),
            record.getObservationDate(),
            record.getSourceName(),
            analysis.toString(),
            "Historical trend analysis based on verified mandi records. Not a guaranteed forecast. Final selling price decision remains with the farmer."
        );
    }
}

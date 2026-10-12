package com.kisansetu.service;

import com.kisansetu.dto.MarketPriceImportDto;
import com.kisansetu.dto.MarketPriceResponse;
import com.kisansetu.entity.MarketPriceRecord;
import com.kisansetu.repository.MarketPriceRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MarketPriceService {

    private final MarketPriceRecordRepository marketPriceRecordRepository;
    private final AuditService auditService;

    public MarketPriceService(MarketPriceRecordRepository marketPriceRecordRepository, AuditService auditService) {
        this.marketPriceRecordRepository = marketPriceRecordRepository;
        this.auditService = auditService;
    }

    public List<MarketPriceResponse> getLatestPrices() {
        return marketPriceRecordRepository.findTop30ByOrderByObservationDateDesc()
            .stream().map(MarketPriceResponse::fromEntity).toList();
    }

    public List<MarketPriceResponse> searchPrices(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getLatestPrices();
        }
        return marketPriceRecordRepository.searchMarketPrices(query.trim())
            .stream().map(MarketPriceResponse::fromEntity).toList();
    }

    public List<MarketPriceResponse> getPricesForCrop(String cropName) {
        return marketPriceRecordRepository.findByCropNameIgnoreCaseOrderByObservationDateDesc(cropName)
            .stream().map(MarketPriceResponse::fromEntity).toList();
    }

    public Optional<MarketPriceRecord> getLatestPriceRecord(String cropName) {
        var list = marketPriceRecordRepository.findByCropNameIgnoreCaseOrderByObservationDateDesc(cropName);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<String> getAvailableCrops() {
        return marketPriceRecordRepository.findDistinctCropNames();
    }

    @Transactional
    public MarketPriceResponse saveRecord(MarketPriceImportDto dto) {
        MarketPriceRecord record = new MarketPriceRecord(
            dto.cropName(),
            dto.marathiName(),
            dto.marketName(),
            dto.district(),
            dto.state(),
            dto.minPrice(),
            dto.maxPrice(),
            dto.modalPrice(),
            dto.unit(),
            dto.observationDate() != null ? dto.observationDate() : LocalDate.now(),
            dto.sourceName() != null ? dto.sourceName() : "Agmarknet APMC",
            "IMP-" + System.currentTimeMillis()
        );
        record = marketPriceRecordRepository.save(record);
        return MarketPriceResponse.fromEntity(record);
    }

    @Transactional
    public int importCsv(MultipartFile file, String adminPhone) throws Exception {
        List<MarketPriceRecord> records = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean header = true;
            while ((line = reader.readLine()) != null) {
                if (header) {
                    header = false;
                    continue;
                }
                String[] parts = line.split(",");
                if (parts.length >= 7) {
                    String cropName = parts[0].trim();
                    String marketName = parts[1].trim();
                    String district = parts[2].trim();
                    BigDecimal min = new BigDecimal(parts[3].trim());
                    BigDecimal max = new BigDecimal(parts[4].trim());
                    BigDecimal modal = new BigDecimal(parts[5].trim());
                    String unit = parts[6].trim();
                    LocalDate date = parts.length >= 8 ? LocalDate.parse(parts[7].trim()) : LocalDate.now();
                    String source = parts.length >= 9 ? parts[8].trim() : "Govt APMC Mandi";

                    MarketPriceRecord r = new MarketPriceRecord(cropName, null, marketName, district, "Maharashtra",
                            min, max, modal, unit, date, source, "CSV-" + System.currentTimeMillis());
                    records.add(r);
                }
            }
        }

        if (!records.isEmpty()) {
            marketPriceRecordRepository.saveAll(records);
            auditService.log("MARKET_PRICE_IMPORT", adminPhone, "MarketPriceRecord", "COUNT:" + records.size(),
                    "Imported " + records.size() + " mandi price records from CSV");
        }

        return records.size();
    }
}

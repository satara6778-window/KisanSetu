package com.kisansetu.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_prices", indexes = {
    @Index(name = "idx_market_crop", columnList = "cropName"),
    @Index(name = "idx_market_name", columnList = "marketName"),
    @Index(name = "idx_market_obs_date", columnList = "observationDate")
})
public class MarketPriceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String cropName;

    @Column(length = 100)
    private String marathiName;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String marketName;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String state;

    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minPrice;

    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal maxPrice;

    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal modalPrice;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String unit = "Quintal";

    @NotNull
    @Column(nullable = false)
    private LocalDate observationDate;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String sourceName; // Agmarknet / APMC Mandi

    @Column(length = 100)
    private String sourceRecordId;

    @Column(nullable = false)
    private LocalDateTime importTimestamp = LocalDateTime.now();

    public MarketPriceRecord() {}

    public MarketPriceRecord(String cropName, String marathiName, String marketName, String district, String state,
                             BigDecimal minPrice, BigDecimal maxPrice, BigDecimal modalPrice,
                             String unit, LocalDate observationDate, String sourceName, String sourceRecordId) {
        this.cropName = cropName;
        this.marathiName = marathiName;
        this.marketName = marketName;
        this.district = district;
        this.state = state;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.modalPrice = modalPrice;
        this.unit = unit != null ? unit : "Quintal";
        this.observationDate = observationDate;
        this.sourceName = sourceName;
        this.sourceRecordId = sourceRecordId;
        this.importTimestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getMarathiName() { return marathiName; }
    public void setMarathiName(String marathiName) { this.marathiName = marathiName; }

    public String getMarketName() { return marketName; }
    public void setMarketName(String marketName) { this.marketName = marketName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public BigDecimal getModalPrice() { return modalPrice; }
    public void setModalPrice(BigDecimal modalPrice) { this.modalPrice = modalPrice; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getObservationDate() { return observationDate; }
    public void setObservationDate(LocalDate observationDate) { this.observationDate = observationDate; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getSourceRecordId() { return sourceRecordId; }
    public void setSourceRecordId(String sourceRecordId) { this.sourceRecordId = sourceRecordId; }

    public LocalDateTime getImportTimestamp() { return importTimestamp; }
    public void setImportTimestamp(LocalDateTime importTimestamp) { this.importTimestamp = importTimestamp; }
}

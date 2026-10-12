package com.kisansetu.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "crop_listings", indexes = {
    @Index(name = "idx_listing_status", columnList = "status"),
    @Index(name = "idx_listing_crop_name", columnList = "cropName"),
    @Index(name = "idx_listing_marathi_alias", columnList = "marathiAlias"),
    @Index(name = "idx_listing_category", columnList = "category"),
    @Index(name = "idx_listing_farmer", columnList = "farmer_id")
})
public class CropListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String cropName;

    @Column(length = 100)
    private String marathiAlias;

    @Column(length = 100)
    private String hindiAlias;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String category; // Vegetables, Fruits, Grains, Pulses, Spices, Cash Crops

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String imageUrl;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal availableQuantity;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String unit; // kg, quintal, crate, tonne

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(length = 50)
    private String qualityGrade; // Grade A, Grade B, Premium, Organic

    @Column(length = 100)
    private String village;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String state;

    @Column(nullable = false)
    private boolean pickupAvailable = true;

    @Column(nullable = false)
    private boolean deliveryAvailable = false;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ListingStatus status = ListingStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Version
    private Long version; // Optimistic locking guard for concurrent edits

    public CropListing() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getFarmer() { return farmer; }
    public void setFarmer(User farmer) { this.farmer = farmer; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getMarathiAlias() { return marathiAlias; }
    public void setMarathiAlias(String marathiAlias) { this.marathiAlias = marathiAlias; }

    public String getHindiAlias() { return hindiAlias; }
    public void setHindiAlias(String hindiAlias) { this.hindiAlias = hindiAlias; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public BigDecimal getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(BigDecimal availableQuantity) { this.availableQuantity = availableQuantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(BigDecimal pricePerUnit) { this.pricePerUnit = pricePerUnit; }

    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public boolean isPickupAvailable() { return pickupAvailable; }
    public void setPickupAvailable(boolean pickupAvailable) { this.pickupAvailable = pickupAvailable; }

    public boolean isDeliveryAvailable() { return deliveryAvailable; }
    public void setDeliveryAvailable(boolean deliveryAvailable) { this.deliveryAvailable = deliveryAvailable; }

    public ListingStatus getStatus() { return status; }
    public void setStatus(ListingStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

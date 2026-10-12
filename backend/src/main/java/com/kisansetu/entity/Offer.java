package com.kisansetu.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers", indexes = {
    @Index(name = "idx_offer_listing", columnList = "listing_id"),
    @Index(name = "idx_offer_buyer", columnList = "buyer_id"),
    @Index(name = "idx_offer_farmer", columnList = "farmer_id"),
    @Index(name = "idx_offer_status", columnList = "status")
})
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private CropListing listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal offeredPrice; // Price per unit proposed by buyer

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal counterPrice; // Optional counter-price proposed by farmer

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OfferStatus status = OfferStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String buyerNotes;

    @Column(columnDefinition = "TEXT")
    private String farmerNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Offer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CropListing getListing() { return listing; }
    public void setListing(CropListing listing) { this.listing = listing; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public User getFarmer() { return farmer; }
    public void setFarmer(User farmer) { this.farmer = farmer; }

    public BigDecimal getOfferedPrice() { return offeredPrice; }
    public void setOfferedPrice(BigDecimal offeredPrice) { this.offeredPrice = offeredPrice; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getCounterPrice() { return counterPrice; }
    public void setCounterPrice(BigDecimal counterPrice) { this.counterPrice = counterPrice; }

    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }

    public String getBuyerNotes() { return buyerNotes; }
    public void setBuyerNotes(String buyerNotes) { this.buyerNotes = buyerNotes; }

    public String getFarmerNotes() { return farmerNotes; }
    public void setFarmerNotes(String farmerNotes) { this.farmerNotes = farmerNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

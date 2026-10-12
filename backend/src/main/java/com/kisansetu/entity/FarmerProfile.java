package com.kisansetu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farmer_profiles")
public class FarmerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Double farmSizeAcres;

    @Column(length = 255)
    private String primaryCrops;

    private Integer experienceYears;

    @Column(length = 100)
    private String upiId;

    private boolean organicCertified = false;

    public FarmerProfile() {}

    public FarmerProfile(User user, Double farmSizeAcres, String primaryCrops, Integer experienceYears, String upiId, boolean organicCertified) {
        this.user = user;
        this.farmSizeAcres = farmSizeAcres;
        this.primaryCrops = primaryCrops;
        this.experienceYears = experienceYears;
        this.upiId = upiId;
        this.organicCertified = organicCertified;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getFarmSizeAcres() { return farmSizeAcres; }
    public void setFarmSizeAcres(Double farmSizeAcres) { this.farmSizeAcres = farmSizeAcres; }

    public String getPrimaryCrops() { return primaryCrops; }
    public void setPrimaryCrops(String primaryCrops) { this.primaryCrops = primaryCrops; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public boolean isOrganicCertified() { return organicCertified; }
    public void setOrganicCertified(boolean organicCertified) { this.organicCertified = organicCertified; }
}

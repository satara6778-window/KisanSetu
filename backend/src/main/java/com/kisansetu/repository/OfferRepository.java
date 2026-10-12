package com.kisansetu.repository;

import com.kisansetu.entity.Offer;
import com.kisansetu.entity.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByListingIdOrderByCreatedAtDesc(Long listingId);

    List<Offer> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Offer> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    List<Offer> findByBuyerIdAndStatus(Long buyerId, OfferStatus status);

    List<Offer> findByFarmerIdAndStatus(Long farmerId, OfferStatus status);
}

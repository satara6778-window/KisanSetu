package com.kisansetu.repository;

import com.kisansetu.entity.CropListing;
import com.kisansetu.entity.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CropListingRepository extends JpaRepository<CropListing, Long> {

    List<CropListing> findByStatusOrderByCreatedAtDesc(ListingStatus status);

    List<CropListing> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    @Query("SELECT c FROM CropListing c WHERE c.status = 'ACTIVE' AND (" +
           "LOWER(c.cropName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(c.marathiAlias, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(c.hindiAlias, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(c.village, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(c.category, '')) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<CropListing> searchActiveListings(@Param("query") String query);

    @Query("SELECT c FROM CropListing c WHERE c.status = 'ACTIVE' AND " +
           "(:category IS NULL OR LOWER(c.category) = LOWER(:category)) AND " +
           "(:minPrice IS NULL OR c.pricePerUnit >= :minPrice) AND " +
           "(:maxPrice IS NULL OR c.pricePerUnit <= :maxPrice) AND " +
           "(:grade IS NULL OR LOWER(c.qualityGrade) = LOWER(:grade))")
    List<CropListing> filterListings(
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("grade") String grade
    );

    /**
     * Atomically reduces stock if availableQuantity >= requested quantity.
     * Prevents race conditions and overselling without locking the entire table.
     * Returns 1 if successful, 0 if insufficient stock.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE CropListing c SET c.availableQuantity = c.availableQuantity - :quantity WHERE c.id = :id AND c.availableQuantity >= :quantity")
    int reduceStockAtomically(@Param("id") Long id, @Param("quantity") BigDecimal quantity);

    /**
     * Replenishes stock if an order is cancelled.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE CropListing c SET c.availableQuantity = c.availableQuantity + :quantity WHERE c.id = :id")
    int restoreStockAtomically(@Param("id") Long id, @Param("quantity") BigDecimal quantity);
}

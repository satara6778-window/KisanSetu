package com.kisansetu.repository;

import com.kisansetu.entity.MarketPriceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketPriceRecordRepository extends JpaRepository<MarketPriceRecord, Long> {

    List<MarketPriceRecord> findByCropNameIgnoreCaseOrderByObservationDateDesc(String cropName);

    List<MarketPriceRecord> findTop30ByOrderByObservationDateDesc();

    @Query("SELECT m FROM MarketPriceRecord m WHERE " +
           "LOWER(m.cropName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(m.marathiName, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.marketName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(m.district, '')) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY m.observationDate DESC")
    List<MarketPriceRecord> searchMarketPrices(@Param("query") String query);

    @Query("SELECT DISTINCT m.cropName FROM MarketPriceRecord m ORDER BY m.cropName")
    List<String> findDistinctCropNames();
}

package com.kisansetu.repository;

import com.kisansetu.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    Optional<Review> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);
}

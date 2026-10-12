package com.kisansetu.repository;

import com.kisansetu.entity.Order;
import com.kisansetu.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdempotencyKey(String idempotencyKey);

    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Order> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
}

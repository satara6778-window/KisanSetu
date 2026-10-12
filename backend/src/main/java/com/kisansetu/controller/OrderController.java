package com.kisansetu.controller;

import com.kisansetu.dto.OrderCreateRequest;
import com.kisansetu.dto.OrderResponse;
import com.kisansetu.dto.OrderStatusUpdateRequest;
import com.kisansetu.entity.User;
import com.kisansetu.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.ok(orderService.createOrder(user, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(user, id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(user, id, request.status()));
    }

    @GetMapping("/buyer")
    public ResponseEntity<List<OrderResponse>> getBuyerOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getBuyerOrders(user.getId()));
    }

    @GetMapping("/farmer")
    public ResponseEntity<List<OrderResponse>> getFarmerOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getFarmerOrders(user.getId()));
    }
}

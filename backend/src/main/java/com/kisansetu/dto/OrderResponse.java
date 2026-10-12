package com.kisansetu.dto;

import com.kisansetu.entity.DeliveryType;
import com.kisansetu.entity.Order;
import com.kisansetu.entity.OrderStatus;
import com.kisansetu.entity.PaymentMethod;
import com.kisansetu.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    String orderNumber,
    UserDto buyer,
    UserDto farmer,
    List<OrderItemDto> items,
    DeliveryType deliveryType,
    String deliveryAddress,
    OrderStatus status,
    BigDecimal subtotal,
    BigDecimal platformFee,
    BigDecimal totalAmount,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    String idempotencyKey,
    String notes,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static OrderResponse fromEntity(Order order) {
        if (order == null) return null;
        List<OrderItemDto> itemDtos = order.getItems() != null
            ? order.getItems().stream().map(OrderItemDto::fromEntity).toList()
            : List.of();

        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            UserDto.fromEntity(order.getBuyer()),
            UserDto.fromEntity(order.getFarmer()),
            itemDtos,
            order.getDeliveryType(),
            order.getDeliveryAddress(),
            order.getStatus(),
            order.getSubtotal(),
            order.getPlatformFee(),
            order.getTotalAmount(),
            order.getPaymentMethod(),
            order.getPaymentStatus(),
            order.getIdempotencyKey(),
            order.getNotes(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }
}

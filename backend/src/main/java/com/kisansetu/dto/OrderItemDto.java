package com.kisansetu.dto;

import com.kisansetu.entity.OrderItem;
import java.math.BigDecimal;

public record OrderItemDto(
    Long id,
    Long listingId,
    String cropName,
    BigDecimal quantity,
    String unit,
    BigDecimal pricePerUnit,
    BigDecimal totalPrice
) {
    public static OrderItemDto fromEntity(OrderItem item) {
        if (item == null) return null;
        return new OrderItemDto(
            item.getId(),
            item.getListing() != null ? item.getListing().getId() : null,
            item.getCropName(),
            item.getQuantity(),
            item.getUnit(),
            item.getPricePerUnit(),
            item.getTotalPrice()
        );
    }
}

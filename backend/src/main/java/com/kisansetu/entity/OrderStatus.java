package com.kisansetu.entity;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PLACED,
    ACCEPTED,
    CONFIRMED,
    PACKED,
    SHIPPED,
    READY_FOR_PICKUP,
    PICKED_UP,
    DELIVERED,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus next, DeliveryType deliveryType) {
        if (this == CANCELLED || this == COMPLETED) {
            return false;
        }

        if (next == CANCELLED) {
            // Can be cancelled only before packed
            return this == PLACED || this == ACCEPTED;
        }

        if (deliveryType == DeliveryType.PICKUP) {
            return switch (this) {
                case PLACED -> next == ACCEPTED;
                case ACCEPTED -> next == CONFIRMED;
                case CONFIRMED -> next == PACKED;
                case PACKED -> next == READY_FOR_PICKUP;
                case READY_FOR_PICKUP -> next == PICKED_UP;
                case PICKED_UP -> next == COMPLETED;
                default -> false;
            };
        } else {
            // Standard Delivery
            return switch (this) {
                case PLACED -> next == ACCEPTED;
                case ACCEPTED -> next == CONFIRMED;
                case CONFIRMED -> next == PACKED;
                case PACKED -> next == SHIPPED;
                case SHIPPED -> next == DELIVERED;
                case DELIVERED -> next == COMPLETED;
                default -> false;
            };
        }
    }
}

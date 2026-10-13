package com.newshop.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCompletedEvent {
    private Long orderId;
    private Long paymentId;
    private String paymentMethod;
    private BigDecimal amount;
    private boolean success;
    private LocalDateTime completedAt;
}

package com.newshop.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDeductedEvent {
    private Long orderId;
    private boolean success;
    private String message;
    private LocalDateTime timestamp;
}

package com.newshop.order.consumer;

import com.newshop.common.event.OrderStatus;
import com.newshop.common.event.PaymentCompletedEvent;
import com.newshop.common.event.StockDeductedEvent;
import com.newshop.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderKafkaConsumer {

    private final OrderService orderService;

    @KafkaListener(topics = "payment-completed-topic", groupId = "order-service-group")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("결제 완료 이벤트 수신: orderId={}, success={}", event.getOrderId(), event.isSuccess());
        if (event.isSuccess()) {
            orderService.updateOrderStatus(event.getOrderId(), OrderStatus.PAID);
        } else {
            orderService.updateOrderStatus(event.getOrderId(), OrderStatus.FAILED);
        }
    }

    @KafkaListener(topics = "stock-deducted-topic", groupId = "order-service-group")
    public void handleStockDeducted(StockDeductedEvent event) {
        log.info("재고 차감 이벤트 수신: orderId={}, success={}", event.getOrderId(), event.isSuccess());
        if (event.isSuccess()) {
            orderService.updateOrderStatus(event.getOrderId(), OrderStatus.COMPLETED);
        } else {
            orderService.updateOrderStatus(event.getOrderId(), OrderStatus.FAILED);
        }
    }
}

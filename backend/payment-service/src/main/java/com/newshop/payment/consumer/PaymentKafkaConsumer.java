package com.newshop.payment.consumer;

import com.newshop.common.event.OrderCreatedEvent;
import com.newshop.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentKafkaConsumer {

    private final PaymentService paymentService;

    @KafkaListener(topics = "order-created-topic", groupId = "payment-service-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("주문 생성 이벤트 수신 (결제 처리 시작): orderId={}, totalAmount={}", event.getOrderId(), event.getTotalAmount());
        try {
            paymentService.processPayment(
                    event.getOrderId(),
                    event.getUserId(),
                    event.getTotalAmount(),
                    "CREDIT_CARD"
            );
        } catch (Exception e) {
            log.error("결제 처리 실패: orderId={}, error={}", event.getOrderId(), e.getMessage());
        }
    }
}

package com.newshop.product.consumer;

import com.newshop.common.event.OrderCreatedEvent;
import com.newshop.common.event.StockDeductedEvent;
import com.newshop.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductKafkaConsumer {

    private final ProductService productService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String STOCK_DEDUCTED_TOPIC = "stock-deducted-topic";

    @KafkaListener(topics = "order-created-topic", groupId = "product-service-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("주문 생성 이벤트 수신 (재고 차감 진행): orderId={}", event.getOrderId());
        try {
            productService.deductStocks(event.getItems());

            StockDeductedEvent stockEvent = StockDeductedEvent.builder()
                    .orderId(event.getOrderId())
                    .success(true)
                    .message("모든 상품 재고 차감 완료")
                    .timestamp(LocalDateTime.now())
                    .build();

            kafkaTemplate.send(STOCK_DEDUCTED_TOPIC, String.valueOf(event.getOrderId()), stockEvent);
            log.info("재고 차감 성공 이벤트 발행: orderId={}", event.getOrderId());
        } catch (Exception e) {
            log.error("재고 차감 처리 중 오류 발생: orderId={}, error={}", event.getOrderId(), e.getMessage());

            StockDeductedEvent failEvent = StockDeductedEvent.builder()
                    .orderId(event.getOrderId())
                    .success(false)
                    .message("재고 부족 또는 오류: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build();

            kafkaTemplate.send(STOCK_DEDUCTED_TOPIC, String.valueOf(event.getOrderId()), failEvent);
        }
    }
}

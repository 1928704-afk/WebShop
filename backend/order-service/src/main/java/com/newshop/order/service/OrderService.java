package com.newshop.order.service;

import com.newshop.common.event.OrderCreatedEvent;
import com.newshop.common.event.OrderItemDto;
import com.newshop.common.event.OrderStatus;
import com.newshop.common.exception.CustomException;
import com.newshop.common.exception.ErrorCode;
import com.newshop.order.dto.OrderCreateRequest;
import com.newshop.order.dto.OrderResponse;
import com.newshop.order.entity.Order;
import com.newshop.order.entity.OrderItem;
import com.newshop.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String ORDER_CREATED_TOPIC = "order-created-topic";

    @Transactional
    public OrderResponse createOrder(Long userId, OrderCreateRequest request) {
        BigDecimal totalAmount = request.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .userId(userId)
                .totalAmount(totalAmount)
                .shippingAddress(request.getShippingAddress())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .build();

        for (OrderItemDto itemDto : request.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .productId(itemDto.getProductId())
                    .productName(itemDto.getProductName())
                    .quantity(itemDto.getQuantity())
                    .price(itemDto.getPrice())
                    .build();
            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        log.info("주문 생성 완료: orderId={}, userId={}, totalAmount={}", savedOrder.getId(), userId, totalAmount);

        // Kafka 주문 생성 이벤트 비동기 발행
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .userId(userId)
                .totalAmount(totalAmount)
                .items(request.getItems())
                .createdAt(LocalDateTime.now())
                .build();

        kafkaTemplate.send(ORDER_CREATED_TOPIC, String.valueOf(savedOrder.getId()), event);
        log.info("Kafka order-created-topic 이벤트 발행 완료: orderId={}", savedOrder.getId());

        return OrderResponse.from(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "해당 주문을 조회할 권한이 없습니다.");
        }

        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderResponse::from);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        order.updateStatus(status);
        log.info("주문 상태 변경: orderId={}, status={}", orderId, status);
    }

    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new CustomException(ErrorCode.CANNOT_CANCEL_ORDER);
        }

        order.updateStatus(OrderStatus.CANCELLED);
        log.info("주문 취소 완료: orderId={}", orderId);
    }
}

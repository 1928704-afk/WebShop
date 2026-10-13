package com.newshop.payment.service;

import com.newshop.common.event.PaymentCompletedEvent;
import com.newshop.common.exception.CustomException;
import com.newshop.common.exception.ErrorCode;
import com.newshop.payment.dto.PaymentResponse;
import com.newshop.payment.entity.Payment;
import com.newshop.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String PAYMENT_COMPLETED_TOPIC = "payment-completed-topic";

    @Transactional
    public PaymentResponse processPayment(Long orderId, Long userId, BigDecimal amount, String paymentMethod) {
        log.info("결제 승인 진행: orderId={}, userId={}, amount={}", orderId, userId, amount);

        // 결제 생성 및 성공 처리
        Payment payment = Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .paymentMethod(paymentMethod != null ? paymentMethod : "CREDIT_CARD")
                .status("SUCCESS")
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("결제 완료 저장: paymentId={}, orderId={}", savedPayment.getId(), orderId);

        // Kafka 결제 완료 이벤트 발행
        PaymentCompletedEvent event = PaymentCompletedEvent.builder()
                .orderId(orderId)
                .paymentId(savedPayment.getId())
                .paymentMethod(savedPayment.getPaymentMethod())
                .amount(savedPayment.getAmount())
                .success(true)
                .completedAt(LocalDateTime.now())
                .build();

        kafkaTemplate.send(PAYMENT_COMPLETED_TOPIC, String.valueOf(orderId), event);
        log.info("Kafka payment-completed-topic 이벤트 발행 완료: orderId={}", orderId);

        return PaymentResponse.from(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));
        return PaymentResponse.from(payment);
    }
}

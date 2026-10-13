package com.newshop.payment.entity;

import com.newshop.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String paymentMethod; // CREDIT_CARD, EASY_PAY, BANK_TRANSFER

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS, FAILED, CANCELLED

    @Column(length = 255)
    private String failureReason;

    @Builder
    public Payment(Long orderId, Long userId, BigDecimal amount, String paymentMethod, String status, String failureReason) {
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "CREDIT_CARD";
        this.status = status != null ? status : "SUCCESS";
        this.failureReason = failureReason;
    }
}

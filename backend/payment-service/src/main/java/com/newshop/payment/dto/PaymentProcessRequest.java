package com.newshop.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class PaymentProcessRequest {

    @NotNull(message = "주문 ID는 필수입니다.")
    private Long orderId;

    @NotNull(message = "결제 금액은 필수입니다.")
    @DecimalMin(value = "0.0", inclusive = false, message = "결제 금액은 0원보다 커야 합니다.")
    private BigDecimal amount;

    private String paymentMethod;
}

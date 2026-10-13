package com.newshop.payment.controller;

import com.newshop.common.dto.ApiResponse;
import com.newshop.payment.dto.PaymentProcessRequest;
import com.newshop.payment.dto.PaymentResponse;
import com.newshop.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody PaymentProcessRequest request
    ) {
        PaymentResponse response = paymentService.processPayment(
                request.getOrderId(),
                userId,
                request.getAmount(),
                request.getPaymentMethod()
        );
        return ResponseEntity.ok(ApiResponse.ok("결제가 완료되었습니다.", response));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}

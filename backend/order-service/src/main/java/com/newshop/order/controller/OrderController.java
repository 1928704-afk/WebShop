package com.newshop.order.controller;

import com.newshop.common.dto.ApiResponse;
import com.newshop.order.dto.OrderCreateRequest;
import com.newshop.order.dto.OrderResponse;
import com.newshop.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody OrderCreateRequest request
    ) {
        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("주문이 접수되었습니다.", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId
    ) {
        OrderResponse response = orderService.getOrder(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @RequestHeader("X-User-Id") Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<OrderResponse> response = orderService.getMyOrders(userId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId
    ) {
        orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("주문이 취소되었습니다.", null));
    }
}

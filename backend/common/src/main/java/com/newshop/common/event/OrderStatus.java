package com.newshop.common.event;

public enum OrderStatus {
    PENDING,    // 결제/재고 처리 대기 중
    PAID,       // 결제 완료
    COMPLETED,  // 주문 완료 및 확정
    FAILED,     // 주문 실패
    CANCELLED   // 주문 취소
}

package com.newshop.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 일반 에러 (COMMON)
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "잘못된 입력값입니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C002", "요청한 리소스를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "서버 내부 오류가 발생했습니다."),

    // 인증/인가 에러 (AUTH)
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "A001", "인증 자격 증명이 유효하지 않습니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "A002", "해당 리소스에 대한 접근 권한이 없습니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "A003", "토큰 유효기간이 만료되었습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "A004", "유효하지 않은 토큰입니다."),

    // 사용자 에러 (USER)
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "사용자를 찾을 수 없습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "U002", "이미 사용 중인 이메일 주소입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "U003", "비밀번호가 일치하지 않습니다."),

    // 상품 에러 (PRODUCT)
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "P001", "상품을 찾을 수 없습니다."),
    OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "P002", "상품 재고가 부족합니다."),

    // 주문 에러 (ORDER)
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "O001", "주문 내역을 찾을 수 없습니다."),
    CANNOT_CANCEL_ORDER(HttpStatus.BAD_REQUEST, "O002", "이미 배송 또는 처리 완료된 주문은 취소할 수 없습니다."),

    // 결제 에러 (PAYMENT)
    PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "PAY001", "결제 처리에 실패했습니다."),
    PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "PAY002", "결제 정보를 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}

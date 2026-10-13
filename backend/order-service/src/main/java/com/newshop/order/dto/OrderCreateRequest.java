package com.newshop.order.dto;

import com.newshop.common.event.OrderItemDto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderCreateRequest {

    @NotEmpty(message = "주문 항목은 최소 1개 이상이어야 합니다.")
    private List<OrderItemDto> items;

    @NotNull(message = "배송지 주소는 필수입니다.")
    private String shippingAddress;

    @NotNull(message = "수령인 이름은 필수입니다.")
    private String receiverName;

    @NotNull(message = "수령인 연락처는 필수입니다.")
    private String receiverPhone;
}

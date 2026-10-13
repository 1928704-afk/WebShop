package com.newshop.order.entity;

import com.newshop.common.entity.BaseTimeEntity;
import com.newshop.common.event.OrderStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(length = 255)
    private String shippingAddress;

    @Column(length = 50)
    private String receiverName;

    @Column(length = 30)
    private String receiverPhone;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Builder
    public Order(Long userId, BigDecimal totalAmount, String shippingAddress, String receiverName, String receiverPhone) {
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.receiverName = receiverName;
        this.receiverPhone = receiverPhone;
        this.status = OrderStatus.PENDING;
    }

    public void addItem(OrderItem item) {
        this.items.add(item);
        item.setOrder(this);
    }

    public void updateStatus(OrderStatus status) {
        this.status = status;
    }
}

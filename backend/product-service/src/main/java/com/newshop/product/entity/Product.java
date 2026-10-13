package com.newshop.product.entity;

import com.newshop.common.entity.BaseTimeEntity;
import com.newshop.common.exception.CustomException;
import com.newshop.common.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 500)
    private String imageUrl;

    @Builder
    public Product(String name, String description, BigDecimal price, Integer stockQuantity, String category, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity != null ? stockQuantity : 0;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public void update(String name, String description, BigDecimal price, Integer stockQuantity, String category, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public void deductStock(int quantity) {
        if (this.stockQuantity < quantity) {
            throw new CustomException(ErrorCode.OUT_OF_STOCK, "재고가 부족합니다: 현재 " + this.stockQuantity + "개, 요청 " + quantity + "개");
        }
        this.stockQuantity -= quantity;
    }

    public void restoreStock(int quantity) {
        this.stockQuantity += quantity;
    }
}

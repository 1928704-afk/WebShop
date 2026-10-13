package com.newshop.product.service;

import com.newshop.common.event.OrderItemDto;
import com.newshop.common.exception.CustomException;
import com.newshop.common.exception.ErrorCode;
import com.newshop.product.dto.ProductCreateRequest;
import com.newshop.product.dto.ProductResponse;
import com.newshop.product.dto.ProductUpdateRequest;
import com.newshop.product.entity.Product;
import com.newshop.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("새로운 상품 등록 완료: productId={}, name={}", savedProduct.getId(), savedProduct.getName());
        return ProductResponse.from(savedProduct);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(Long id) {
        log.info("상품 상세 조회 (DB 조회 실행 - 캐시 미적중): productId={}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        return ProductResponse.from(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(String category, String keyword, Pageable pageable) {
        Page<Product> productPage = productRepository.searchProducts(category, keyword, pageable);
        return productPage.map(ProductResponse::from);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

        product.update(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity(),
                request.getCategory(),
                request.getImageUrl()
        );

        log.info("상품 정보 수정 완료: productId={}", id);
        return ProductResponse.from(product);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        productRepository.deleteById(id);
        log.info("상품 삭제 완료: productId={}", id);
    }

    @Transactional
    public void deductStocks(List<OrderItemDto> items) {
        for (OrderItemDto item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND, "상품 ID " + item.getProductId() + "를 찾을 수 없습니다."));
            product.deductStock(item.getQuantity());
            log.info("재고 차감 완료: productId={}, 차감수량={}, 잔여재고={}", product.getId(), item.getQuantity(), product.getStockQuantity());
        }
    }
}

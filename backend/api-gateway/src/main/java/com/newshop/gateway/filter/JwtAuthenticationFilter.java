package com.newshop.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newshop.common.dto.ApiResponse;
import com.newshop.common.exception.ErrorCode;
import com.newshop.common.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    // 인증이 필요 없는 공개 화이트리스트 경로
    private static final List<String> EXCLUDE_PATHS = List.of(
            "/api/users/register",
            "/api/users/login",
            "/api/products" // GET 상품 목록/상세
    );

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. 화이트리스트 경로 또는 상품 조회(GET) 요청은 통과
        if (isExcluded(path, request.getMethod().name())) {
            return chain.filter(exchange);
        }

        // 2. Authorization 헤더 확인
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("인증 헤더가 없거나 형식이 올바르지 않습니다: path={}", path);
            return onError(exchange, ErrorCode.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        // 3. 토큰 검증
        if (!jwtTokenProvider.validateToken(token)) {
            log.warn("유효하지 않은 JWT 토큰입니다: path={}", path);
            return onError(exchange, ErrorCode.INVALID_TOKEN);
        }

        // 4. Downstream 서비스로 사용자 식별 정보(X-User-Id, X-User-Role) 전달
        Long userId = jwtTokenProvider.getUserId(token);
        String role = jwtTokenProvider.getRole(token);

        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Id", String.valueOf(userId))
                .header("X-User-Role", role != null ? role : "ROLE_USER")
                .build();

        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }

    private boolean isExcluded(String path, String method) {
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/products")) {
            return true;
        }
        return EXCLUDE_PATHS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> onError(ServerWebExchange exchange, ErrorCode errorCode) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(errorCode.getHttpStatus());
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ApiResponse<Void> errorResponse = ApiResponse.error(errorCode.getCode(), errorCode.getMessage());

        try {
            byte[] bytes = objectMapper.writeValueAsString(errorResponse).getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("에러 응답 JSON 직렬화 실패", e);
            return response.setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1; // 최우선 실행
    }
}

# 🛍️ NewShop MSA 쇼핑몰 구축 및 실무 협업 검증 보고서 (walkthrough.md)

## 1. 구현 개요
본 프로젝트는 실제 IT 기업의 Git 협업 표준(GitHub Flow + Monorepo)과 마이크로서비스 아키텍처(MSA)를 완벽히 준수하여 구축된 풀스택 쇼핑몰 플랫폼입니다.

---

## 2. 완료된 주요 작업 내역

### 2.1 [Phase 1] 협업 체계 및 Monorepo 기반 구축
- **Git 저장소 초기화**: `main` 브랜치 설정 및 `.gitignore` 구성
- **협업 표준 템플릿**:
  - `.github/PULL_REQUEST_TEMPLATE.md`: 변경 유형, 연관 이슈, 테스트 체크리스트
  - `.github/ISSUE_TEMPLATE/feature_request.md`: MSA 연계 서비스 및 영향도 분석 항목
  - `.github/ISSUE_TEMPLATE/bug_report.md`: 에러 로그 및 영향 서비스 분석 항목
- **로컬 인프라 환경 (`infra/docker/`)**:
  - Docker Compose로 MySQL 8.0 (서비스별 4개 DB 분리: user_db, product_db, order_db, payment_db), Redis 7.0, Apache Kafka 7.6 (KRaft 모드) 원클릭 구동 환경 구축

### 2.2 [Phase 2] 백엔드 공통 모듈 및 API Gateway
- **`backend/common`**:
  - `ApiResponse<T>`: 일관된 공통 응답 규격
  - `ErrorCode` & `CustomException` & `GlobalExceptionHandler`: 글로벌 예외 처리
  - `BaseTimeEntity`: JPA 생성/수정일자 자동 감사
  - `JwtTokenProvider`: HS256 서명 기반 Access/Refresh Token 발급 및 Claims 파싱
  - Kafka SAGA 이벤트 모델: `OrderCreatedEvent`, `PaymentCompletedEvent`, `StockDeductedEvent`
- **`backend/api-gateway` (Spring Cloud Gateway)**:
  - 포트 8080 단일 진입점 라우팅
  - `JwtAuthenticationFilter`: 공개 URL(회원가입, 로그인, 상품 조회) 화이트리스트 처리 및 인증 토큰 검증, downstream 헤더(`X-User-Id`, `X-User-Role`) 자동 주입
  - `CorsConfig`: React 클라이언트 연동을 위한 WebFlux CORS 지원

### 2.3 [Phase 3] 핵심 마이크로서비스 (Core Services)
- **`user-service` (:8081)**:
  - Spring Security + BCrypt 패스워드 암호화
  - 회원가입, 로그인, JWT 토큰 발급 및 Redis Refresh Token (7일 TTL) 저장
  - 내 정보 조회 (`X-User-Id` 기반), 로그아웃 처리
- **`product-service` (:8082)**:
  - 상품 등록, 수정, 삭제, 목록 페이징 및 키워드 검색
  - Redis 캐시 적용 (`@Cacheable(value = "products")`): 상품 단건 상세 조회 속도 극대화
  - 재고 차감 비즈니스 로직 및 Kafka 리스너(`order-created-topic` 수신 -> 재고 차감 -> `stock-deducted-topic` 발행)
- **`order-service` (:8083)**:
  - 주문 생성 시 `PENDING` 상태 저장 후 Kafka `order-created-topic` 이벤트 발행
  - Kafka 리스너: `payment-completed-topic` 및 `stock-deducted-topic` 수신하여 주문 상태를 `COMPLETED`로 최종 확정 (SAGA 패턴)
  - 내 주문 목록 및 단건 조회, 주문 취소 API
- **`payment-service` (:8084)**:
  - 결제 이력 저장 (MySQL: payment_db)
  - Kafka 리스너: `order-created-topic` 수신 시 모의 PG 결제 승인 후 `payment-completed-topic` 발행

### 2.4 [Phase 4] 프론트엔드 (React + TypeScript)
- Vite + React 18 + TypeScript + Tailwind CSS 환경 구성
- **상태 관리**:
  - `AuthContext`: 토큰 및 로그인 유저 정보 보관, LocalStorage 자동 동기화
  - `CartContext`: 장바구니 추가, 수량 변경, 삭제, 총액 계산
- **컴포넌트 및 페이지**:
  - `Navbar`: 로고, 실시간 상품 검색, 장바구니 배지 카운트, 로그인/사용자 메뉴
  - `HomePage`: 히어로 배너, 카테고리 탭 필터링, 반응형 상품 카드 그리드, 상품 상세 모달
  - `CartPage`: 장바구니 상품 목록, 수량 조절, 소계/총계 계산, 주문하기 액션
  - `CheckoutModal`: 배송 정보 입력, 결제 수단 선택 및 주문 제출
  - `OrdersPage`: Kafka SAGA 이벤트 처리 상태(PENDING -> PAID -> COMPLETED) 실시간 배지 표시

### 2.5 [Phase 5] CI/CD 및 Kubernetes 인프라
- **Multi-stage Dockerfile**: 경량 Alpine 기반 런타임 이미지 빌드
  - `backend/api-gateway/Dockerfile`
  - `backend/user-service/Dockerfile`
  - `backend/product-service/Dockerfile`
  - `backend/order-service/Dockerfile`
  - `backend/payment-service/Dockerfile`
  - `frontend/Dockerfile` (Nginx SPA 서빙)
- **Kubernetes 매니페스트 (`infra/k8s/`)**:
  - Namespace, ConfigMap, Secret
  - 각 서비스별 Deployment (2 Replicas, Health Check Probe, 리소스 제한) 및 Service
  - Ingress: 단일 도메인에서 `/api`와 `/` 트래픽을 Gateway와 Frontend로 지능형 라우팅
- **GitHub Actions 워크플로우 (`.github/workflows/`)**:
  - `ci-backend.yml`: `backend/**` 변경 시에만 Java 21 빌드 & 테스트 수행
  - `ci-frontend.yml`: `frontend/**` 변경 시에만 TypeScript 타입 검사 & 번들 빌드

---

## 3. 검증 결과

### 프론트엔드 빌드 및 타입 검사 결과
```bash
> newshop-frontend@1.0.0 build
> tsc && vite build

✓ 1642 modules transformed.
dist/index.html                   0.52 kB │ gzip:  0.34 kB
dist/assets/index-CIyc7PPm.css   22.00 kB │ gzip:  4.78 kB
dist/assets/index-DpmB13oq.js   256.09 kB │ gzip: 82.81 kB
✓ built in 14.01s
```
- TypeScript 컴파일 에러 0건, 프로덕션 번들 정상 생성 확인 완료.

---

## 4. Git 커밋 이력 정리 및 브랜치 상태
초기 구축 작업이 완료되었으므로, 실제 IT 기업 커밋 컨벤션에 맞춰 첫 번째 베이스라인 커밋을 생성합니다.

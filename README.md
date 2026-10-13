# 🛍️ NewShop: 대규모 트래픽 대비 Spring Boot & React 기반 MSA 쇼핑몰 플랫폼

실제 IT 기업의 협업 표준(GitHub Flow + Monorepo)과 마이크로서비스 아키텍처(MSA)를 완벽히 구현한 엔터프라이즈급 이커머스 솔루션입니다.

---

## 🏗️ 1. 아키텍처 구성도

```text
                                  [ React + TypeScript SPA ] (Vite)
                                                │
                                         [ API Gateway ] (:8080)
                                                │ (JWT Auth & Routing)
         ┌───────────────────────┬──────────────┴──────────────┬───────────────────────┐
         ▼                       ▼                             ▼                       ▼
   [ User Service ]      [ Product Service ]           [ Order Service ]       [ Payment Service ]
       (:8081)                 (:8082)                       (:8083)                 (:8084)
         │                       │                             │                       │
     MySQL (user_db)       MySQL (product_db)            MySQL (order_db)      MySQL (payment_db)
         │                       │                             │                       │
     Redis (Token)         Redis (Cache)                       └───────────┬───────────┘
                                 │                                         │
                                 └───────────── [ Apache Kafka ] ──────────┘
                                                 (Event-Driven SAGA)
```

### 핵심 기술 스택
- **프론트엔드**: React 18, TypeScript, Vite, Tailwind CSS, Axios, Lucide React
- **백엔드**: Java 21, Spring Boot 3.3.4, Spring Cloud Gateway, Spring Data JPA
- **데이터베이스 & 캐시**: MySQL 8.0 (Database per Service), Redis 7.0 (인증 토큰 & 상품 조회 캐싱)
- **메시지 브로커**: Apache Kafka (비동기 이벤트 기반 통신 & SAGA 패턴)
- **인프라 & CI/CD**: Docker (Multi-stage build), Docker Compose, Kubernetes (k8s), GitHub Actions

---

## 🚀 2. Kafka 이벤트 기반 SAGA 분산 트랜잭션 흐름

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자 (React)
    participant Gateway as API Gateway (:8080)
    participant Order as Order Service (:8083)
    participant Kafka as Apache Kafka (:9092)
    participant Payment as Payment Service (:8084)
    participant Product as Product Service (:8082)

    User->>Gateway: POST /api/orders (주문 생성 요청)
    Gateway->>Order: 라우팅 & 토큰 검증 (X-User-Id 전달)
    Order->>Order: 주문 상태 'PENDING' 저장
    Order->>Kafka: 'order-created-topic' 이벤트 발행
    
    par 1. 결제 트랜잭션
        Kafka->>Payment: 이벤트 컨슈밍 & 결제 처리
        Payment->>Payment: 결제 레코드 저장 (SUCCESS)
        Payment->>Kafka: 'payment-completed-topic' 이벤트 발행
    and 2. 재고 차감 트랜잭션
        Kafka->>Product: 이벤트 컨슈밍 & 상품 재고 차감
        Product->>Product: stockQuantity 차감
        Product->>Kafka: 'stock-deducted-topic' 이벤트 발행
    end

    Kafka->>Order: 이벤트 수신 후 주문 상태 'COMPLETED'로 최종 확정
    User->>Gateway: GET /api/orders/my (실시간 주문 확정 상태 확인)
```

---

## 👥 3. IT 기업 실무 협업 표준 & Git 브랜치 전략

### 3.1 브랜치 전략: GitHub Flow
- **`main`**: 항상 배포 가능한 최신 프로덕션 브랜치 (Protected Branch 설정)
- **`feature/<기능명>`**: 서비스별/도메인별 기능 개발 브랜치 (예: `feature/order-saga`, `feature/user-auth`)
- **`fix/<버그명>`**: 일반 버그 수정 브랜치
- **`hotfix/<긴급패치>`**: 운영 장애 즉각 대응 브랜치

### 3.2 Monorepo CI/CD (Path-based Filtering)
하나의 저장소에서 프론트엔드와 여러 백엔드 마이크로서비스를 관리하되, GitHub Actions의 `paths` 필터를 적용하여 **수정된 서비스만 독립적으로 빌드·테스트·배포**합니다.
- `backend/**` 변경 시: Java 21 빌드, 단위 테스트 수행
- `frontend/**` 변경 시: TypeScript 컴파일 및 Vite 번들 빌드

### 3.3 실무 개발 7단계 사이클
1. **GitHub Issue 생성**: 작업 목적, 요구사항, 완료 조건(Acceptance Criteria) 명시
2. **기능 브랜치 생성**: `git switch -c feature/order-saga`
3. **코드 작성 및 단위/통합 테스트**: 클린 코드 및 비즈니스 로직 작성
4. **커밋 컨벤션 준수**:
   - `feat:` 새로운 기능 추가
   - `fix:` 버그 수정
   - `refactor:` 코드 리팩토링
   - `test:` 테스트 코드 작성
   - `chore:` 빌드 스크립트 및 설정 변경
5. **Pull Request (PR) 생성**: PR 템플릿에 따라 변경 내용 및 검증 결과 기술
6. **자동화 CI 파이프라인 검증**: GitHub Actions 자동 빌드/테스트 통과
7. **코드 리뷰 및 Squash & Merge**: 동료 리뷰(최소 1인 승인) 후 main 병합 및 브랜치 삭제

---

## 💻 4. 로컬 개발 환경 실행 방법

### 4.1 데이터베이스 & Kafka 인프라 실행 (Docker Compose)
MySQL(4개 독립 DB 스키마 생성), Redis, Kafka를 원클릭으로 구동합니다:
```bash
cd infra/docker
docker compose up -d
```
- **MySQL**: `localhost:3306` (계정: `shopuser` / 비번: `shoppassword`)
  - `user_db`, `product_db`, `order_db`, `payment_db`
- **Redis**: `localhost:6379`
- **Kafka**: `localhost:9092`

### 4.2 백엔드 마이크로서비스 실행 (Spring Boot)
```bash
cd backend
# 백엔드 전체 빌드
./gradlew build -x test

# 각 서비스 실행 (개별 터미널)
./gradlew :api-gateway:bootRun       # Port 8080
./gradlew :user-service:bootRun      # Port 8081
./gradlew :product-service:bootRun   # Port 8082
./gradlew :order-service:bootRun     # Port 8083
./gradlew :payment-service:bootRun   # Port 8084
```

### 4.3 프론트엔드 실행 (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
브라우저에서 `http://localhost:5173` 접속 시 모던 쇼핑몰 화면을 바로 이용하실 수 있습니다.

---

## 🧪 5. E2E API 테스트 (Postman) & 대용량 부하/성능 테스트 (k6)

본 프로젝트는 마이크로서비스 간 비즈니스 정합성 검증(Postman)과 대규모 동시 트래픽 환경에서의 성능/복원력 검증(k6)을 위한 테스트 스위트를 완비하고 있습니다.

### 5.1 Postman E2E 시나리오 테스트
전체 9단계 마이크로서비스 비즈니스 흐름(회원가입 ➔ 로그인/JWT 추출 ➔ 내 정보 ➔ 상품 등록 ➔ 목록/캐시 조회 ➔ 주문 접수/SAGA ➔ 결제 검증)을 순차 검증합니다:

```bash
# Newman CLI를 통한 자동화 E2E 테스트 실행
npm install -g newman # 최초 1회
newman run tests/postman/newshop-api-collection.json \
  -e tests/postman/newshop-environment.json
```

### 5.2 k6 대용량 부하/성능 테스트 (Load Testing)

#### ① 상품 조회 및 Redis 캐시 부하 테스트 (`product-read-load-test.js`)
가상 사용자(VUs) 50명이 상품 목록 및 상세 조회를 지속적으로 요청할 때, **Redis 캐시의 응답 시간 최적화 및 안정성**을 검증합니다:
```bash
k6 run tests/k6/product-read-load-test.js
```
- **성능 임계치 (Thresholds)**:
  - `http_req_duration`: `p(95) < 200ms` (95%의 요청이 200ms 이내에 처리되어야 성공)
  - `http_req_failed`: `rate < 0.01` (에러율 1% 미만 유지)

#### ② 동시 주문 생성 및 Kafka SAGA 스트레스 테스트 (`order-saga-stress-test.js`)
동시에 30명의 사용자가 결제/주문을 접수할 때, **Kafka 메시지 브로커의 비동기 처리량과 SAGA 트랜잭션 수용력**을 검증합니다:
```bash
k6 run tests/k6/order-saga-stress-test.js
```
- **성능 임계치 (Thresholds)**:
  - `http_req_duration`: `p(95) < 400ms` (비동기 이벤트 발행 지연 400ms 이내)
  - `http_req_failed`: `rate < 0.05` (에러율 5% 미만 유지)

---

## ☸️ 6. Kubernetes (k8s) 프로덕션 배포

`infra/k8s` 디렉터리에 정의된 매니페스트를 적용하여 쿠버네티스 클러스터에 배포할 수 있습니다:
```bash
kubectl apply -f infra/k8s/00-namespace.yaml
kubectl apply -f infra/k8s/01-configmaps-secrets.yaml
kubectl apply -f infra/k8s/
```
- 무중단 롤링 업데이트 (`Deployment` replicas 2개)
- Liveness / Readiness 프로브를 통한 장애 자동 복구
- Ingress를 통한 단일 진입점 외부 라우팅 (`/api` -> 게이트웨이, `/` -> 프론트엔드)

---

## 📁 7. 디렉터리 구조

```text
newShop/
├── .github/
│   ├── ISSUE_TEMPLATE/       # 기능 개발 및 버그 제보 템플릿
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/            # 백엔드 및 프론트엔드 독립 CI 파이프라인
├── backend/
│   ├── build.gradle          # 루트 멀티 모듈 빌드 설정
│   ├── settings.gradle
│   ├── common/               # 공통 DTO, ErrorCode, JWT, Kafka Event
│   ├── api-gateway/          # Spring Cloud Gateway (라우팅 & 인증)
│   ├── user-service/         # 사용자 & 인증 서비스
│   ├── product-service/      # 상품 & 재고 서비스 (Redis 캐싱)
│   ├── order-service/        # 주문 관리 & Kafka Producer
│   └── payment-service/      # 결제 승인 & Kafka Consumer
├── frontend/                 # React 18 + TypeScript + Vite SPA
├── infra/
│   ├── docker/               # 로컬 Docker Compose 인프라
│   └── k8s/                  # 쿠버네티스 배포 매니페스트
├── tests/
│   ├── postman/              # Postman 컬렉션 & 환경 변수
│   ├── k6/                   # k6 부하/스트레스 테스트 스크립트
│   └── README.md             # 상세 테스트 실행 가이드
├── task.md                   # 단계별 진행 태스크 목록
├── implementation_plan.md    # 상세 구현 설계 문서
└── README.md
```

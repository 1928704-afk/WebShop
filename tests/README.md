# 🧪 NewShop API 및 부하/성능 테스트 가이드 (Postman & k6)

본 디렉터리는 NewShop MSA 플랫폼의 기능적 E2E 검증(Postman)과 대용량 트래픽 부하/성능 검증(k6)을 위한 통합 테스트 스위트입니다.

---

## 📮 1. Postman E2E 테스트

### 1.1 Postman GUI에서 실행
1. Postman 앱 실행 후 **Import** 클릭
2. `tests/postman/newshop-api-collection.json` 및 `tests/postman/newshop-environment.json` 선택 후 가져오기
3. 우측 상단 환경(Environment)을 **NewShop Local Environment**로 지정
4. 컬렉션 러너(Collection Runner)를 통해 전체 9개 요청을 순차 실행

### 1.2 Newman (Postman CLI)을 통한 자동화 실행
```bash
# newman 설치 (최초 1회)
npm install -g newman

# 컬렉션 실행 및 리포트 출력
newman run tests/postman/newshop-api-collection.json \
  -e tests/postman/newshop-environment.json \
  --reporters cli
```

---

## ⚡ 2. k6 대용량 부하/성능 테스트

### 2.1 상품 조회 및 Redis 캐시 부하 테스트 (`product-read-load-test.js`)
다수의 가상 사용자(VUs 50명)가 상품 목록 및 상품 상세를 지속적으로 조회할 때의 Redis 캐시 응답 속도와 임계치(p95 < 200ms)를 검증합니다.
```bash
k6 run tests/k6/product-read-load-test.js
```
- **주요 검증 항목**:
  - `p(95) < 200ms`: 95%의 요청이 200ms 이내에 처리되는지 검증
  - `http_req_failed < 1%`: 에러율 1% 미만 유지 여부

### 2.2 동시 주문 생성 & Kafka SAGA 스트레스 테스트 (`order-saga-stress-test.js`)
대규모 동시 주문 트랜잭션 발생 시 Kafka 메시지 브로커와 비동기 SAGA 파이프라인의 처리량을 측정합니다.
```bash
k6 run tests/k6/order-saga-stress-test.js
```

---

## 📊 3. 테스트 실행 지표 해석
- `http_req_duration`: 서버의 실제 요청 처리 소요 시간 (평균, p90, p95, p99)
- `http_req_failed`: 오류 응답(4xx, 5xx)의 비율
- `iterations`: 지정된 시간 동안 완료된 총 시나리오 반복 횟수
- `vus`: 현재 활성화된 가상 사용자 수

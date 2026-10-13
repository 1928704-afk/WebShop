import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. k6 부하 테스트 옵션 (VUs 램프업 및 임계치 설정)
export const options = {
  stages: [
    { duration: '10s', target: 20 },  // 10초 동안 가상 사용자 20명으로 증가 (Warm-up)
    { duration: '30s', target: 50 },  // 30초 동안 가상 사용자 50명 유지 (Peak Load)
    { duration: '10s', target: 0 },   // 10초 동안 가상 사용자 0명으로 감소 (Cool-down)
  ],
  thresholds: {
    // 95%의 요청이 200ms 이내에 응답해야 함 (Redis 캐시 성능 검증)
    http_req_duration: ['p(95)<200'],
    // HTTP 실패율 1% 미만이어야 함
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export default function () {
  // 1. 상품 목록 조회 (페이징 & 카테고리 필터)
  const listRes = http.get(`${BASE_URL}/api/products?category=전자제품&page=0&size=12`);
  check(listRes, {
    '상품 목록 응답 성공 (200 OK)': (r) => r.status === 200,
    '목록 응답 시간 150ms 이내': (r) => r.timings.duration < 150,
  });

  sleep(0.5);

  // 2. 상품 상세 조회 (Redis 캐시 적중 여부 성능 테스트)
  const productId = 1;
  const detailRes = http.get(`${BASE_URL}/api/products/${productId}`);
  check(detailRes, {
    '상품 상세 응답 성공 (200 OK)': (r) => r.status === 200,
    '캐시 조회 응답 시간 100ms 이내': (r) => r.timings.duration < 100,
  });

  sleep(1);
}

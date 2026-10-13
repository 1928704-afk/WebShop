import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. 스트레스 테스트 옵션
export const options = {
  stages: [
    { duration: '10s', target: 10 }, // 10 VUs
    { duration: '20s', target: 30 }, // 30 VUs 동시 주문 트랜잭션
    { duration: '10s', target: 0 },  // Cool-down
  ],
  thresholds: {
    // 주문 생성 API 95% 응답 시간 400ms 이내 (비동기 Kafka 발행이므로 빨라야 함)
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.05'], // 실패율 5% 미만
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// 테스트 전 토큰 획득 (setup 단계)
export function setup() {
  const loginPayload = JSON.stringify({
    email: 'tester@example.com',
    password: 'password1234!',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // 사전 로그인 시도
  const loginRes = http.post(`${BASE_URL}/api/users/login`, loginPayload, params);
  let token = '';

  if (loginRes.status === 200) {
    const data = JSON.parse(loginRes.body);
    token = data.data.accessToken;
  } else {
    // 회원이 없으면 가입 시도
    const regPayload = JSON.stringify({
      email: 'tester@example.com',
      password: 'password1234!',
      name: '부하테스터',
      phone: '010-1111-2222',
      address: '서울시 강남구',
    });
    http.post(`${BASE_URL}/api/users/register`, regPayload, params);
    const retryLogin = http.post(`${BASE_URL}/api/users/login`, loginPayload, params);
    if (retryLogin.status === 200) {
      token = JSON.parse(retryLogin.body).data.accessToken;
    }
  }

  return { token: token };
}

export default function (data) {
  const token = data.token;
  if (!token) {
    sleep(1);
    return;
  }

  const orderPayload = JSON.stringify({
    items: [
      {
        productId: 1,
        productName: 'Apple 맥북 프로 16인치 M3 Max',
        quantity: 1,
        price: 3990000,
      },
    ],
    shippingAddress: '서울특별시 강남구 테헤란로 152',
    receiverName: '부하테스터',
    receiverPhone: '010-1234-5678',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // 주문 접수 (Kafka 이벤트 발행)
  const orderRes = http.post(`${BASE_URL}/api/orders`, orderPayload, params);
  check(orderRes, {
    '주문 생성 성공 (201 Created)': (r) => r.status === 201,
  });

  sleep(1);
}

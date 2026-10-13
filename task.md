# MSA 쇼핑몰 프로젝트 개발 작업 목록 (task.md)

## [Phase 1] 협업 체계 및 Monorepo 기반 구축
- [x] Git 저장소 초기화 및 기본 브랜치(main) 구성 <!-- id: 1-1 -->
- [x] IT 기업 표준 협업 규칙 정의 (.github/PULL_REQUEST_TEMPLATE.md, ISSUE_TEMPLATE 등) <!-- id: 1-2 -->
- [x] Monorepo 루트 디렉터리 구조 및 빌드 체계 구성 <!-- id: 1-3 -->
- [x] 로컬 인프라 실행 환경 구성 (Docker Compose: MySQL x 4, Redis, Kafka, Zookeeper/Kraft) <!-- id: 1-4 -->

## [Phase 2] 백엔드 공통 모듈 및 API Gateway 구축
- [x] Common/Core 라이브러리 모듈 구현 (공통 응답 포맷, 예외 처리, JWT 유틸, Kafka Event 스키마) <!-- id: 2-1 -->
- [x] API Gateway (Spring Cloud Gateway) 구현 (라우팅, JWT 글로벌 필터, CORS 설정) <!-- id: 2-2 -->

## [Phase 3] 핵심 마이크로서비스(Core Services) 개발
- [x] User Service 개발 (회원가입, 로그인, JWT 발급, 사용자 정보 관리, MySQL + Redis) <!-- id: 3-1 -->
- [x] Product Service 개발 (상품 등록/수정/조회, 재고 관리, MySQL + Redis 캐싱) <!-- id: 3-2 -->
- [x] Order Service 개발 (주문 생성, 주문 상태 머신, Kafka 이벤트 발행) <!-- id: 3-3 -->
- [x] Payment Service 개발 (결제 승인/취소, Kafka 이벤트 컨슈밍 및 결제 결과 발행) <!-- id: 3-4 -->

## [Phase 4] 프론트엔드 (React + TypeScript) 개발
- [x] React + TypeScript + Vite 프로젝트 셋업 (라우터, 상태 관리, 스타일링) <!-- id: 4-1 -->
- [x] UI 컴포넌트 및 페이지 구현 (로그인/회원가입, 상품 목록/상세, 장바구니, 주문/결제 화면) <!-- id: 4-2 -->
- [x] API Gateway 연동 및 에러 처리 / 인증 토큰 관리 인터셉터 구현 <!-- id: 4-3 -->

## [Phase 5] CI/CD 및 Kubernetes 배포 인프라 구축
- [x] 서비스별 Dockerfile 작성 (Multi-stage build) <!-- id: 5-1 -->
- [x] Monorepo Path Filtering 기반 GitHub Actions 워크플로우 구성 (PR 테스트, 이미지 빌드/푸시) <!-- id: 5-2 -->
- [x] Kubernetes 매니페스트 작성 (Deployments, Services, ConfigMaps, Ingress) <!-- id: 5-3 -->

## [Phase 6] 종합 검증 및 문서화
- [x] 로컬 환경 통합 실행 및 End-to-End 동작 검증 <!-- id: 6-1 -->
- [x] README.md 및 아키텍처/협업 가이드 문서 작성 <!-- id: 6-2 -->

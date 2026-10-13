# 1. 빌드 스테이지
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# 루트 및 공통 모듈, 서브 프로젝트 복사
COPY settings.gradle build.gradle gradlew* ./
COPY gradle ./gradle
COPY common ./common
COPY api-gateway ./api-gateway

# 게이트웨이 JAR 빌드
RUN chmod +x ./gradlew 2>/dev/null || true
RUN if [ -f ./gradlew ]; then ./gradlew :api-gateway:bootJar -x test; else echo "Build in local or CI"; fi

# 2. 실행 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root 사용자 생성 및 보안 강화
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /workspace/api-gateway/build/libs/*.jar app.jar 2>/dev/null || true

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

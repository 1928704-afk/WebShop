# 1. 빌드 스테이지
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

COPY settings.gradle build.gradle gradlew* ./
COPY gradle ./gradle
COPY common ./common
COPY order-service ./order-service

RUN chmod +x ./gradlew 2>/dev/null || true
RUN if [ -f ./gradlew ]; then ./gradlew :order-service:bootJar -x test; fi

# 2. 실행 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /workspace/order-service/build/libs/*.jar app.jar 2>/dev/null || true

EXPOSE 8083
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

# 1. 빌드 스테이지
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. 프로덕션 Nginx 서빙 스테이지
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 라우팅 및 Gateway 프록시를 위한 nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

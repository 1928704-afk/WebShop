-- MSA 서비스별 독립 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS product_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 계정 권한 부여
GRANT ALL PRIVILEGES ON user_db.* TO 'shopuser'@'%';
GRANT ALL PRIVILEGES ON product_db.* TO 'shopuser'@'%';
GRANT ALL PRIVILEGES ON order_db.* TO 'shopuser'@'%';
GRANT ALL PRIVILEGES ON payment_db.* TO 'shopuser'@'%';

FLUSH PRIVILEGES;

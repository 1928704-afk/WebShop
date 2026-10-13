package com.newshop.user.service;

import com.newshop.common.exception.CustomException;
import com.newshop.common.exception.ErrorCode;
import com.newshop.common.security.JwtTokenProvider;
import com.newshop.user.dto.LoginResponse;
import com.newshop.user.dto.UserLoginRequest;
import com.newshop.user.dto.UserRegisterRequest;
import com.newshop.user.dto.UserResponse;
import com.newshop.user.entity.User;
import com.newshop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REDIS_REFRESH_TOKEN_PREFIX = "RT:";

    @Transactional
    public UserResponse register(UserRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role("ROLE_USER")
                .build();

        User savedUser = userRepository.save(user);
        log.info("신규 사용자 회원가입 완료: userId={}, email={}", savedUser.getId(), savedUser.getEmail());
        return UserResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        // Refresh Token을 Redis에 저장 (7일 보관)
        redisTemplate.opsForValue().set(
                REDIS_REFRESH_TOKEN_PREFIX + user.getId(),
                refreshToken,
                7,
                TimeUnit.DAYS
        );

        log.info("사용자 로그인 성공: userId={}", user.getId());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }

    public void logout(Long userId) {
        redisTemplate.delete(REDIS_REFRESH_TOKEN_PREFIX + userId);
        log.info("사용자 로그아웃 완료: userId={}", userId);
    }
}

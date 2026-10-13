package com.newshop.user.dto;

import com.newshop.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String phone;
    private String address;
    private String role;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

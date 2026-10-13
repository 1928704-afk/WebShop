package com.newshop.user.entity;

import com.newshop.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(nullable = false, length = 20)
    private String role; // ROLE_USER, ROLE_ADMIN

    @Builder
    public User(String email, String password, String name, String phone, String address, String role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.role = role != null ? role : "ROLE_USER";
    }

    public void updateProfile(String name, String phone, String address) {
        this.name = name;
        this.phone = phone;
        this.address = address;
    }
}

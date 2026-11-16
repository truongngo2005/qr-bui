package com.coffeeshop.shiftsystem.dto.response;

import com.coffeeshop.shiftsystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private Role role;
    private String position;
    private BigDecimal hourlyRate;
    private String maskedEmail;
    private String testOtp; // Hiển thị trên Dev/Demo để tiện test
}

package com.coffeeshop.shiftsystem.dto.response;

import com.coffeeshop.shiftsystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private Role role;
    private String position;
    private BigDecimal hourlyRate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

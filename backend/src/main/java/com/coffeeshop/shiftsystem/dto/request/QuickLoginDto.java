package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuickLoginDto {
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    private String deviceToken;
}

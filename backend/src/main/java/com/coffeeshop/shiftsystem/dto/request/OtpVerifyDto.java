package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyDto {
    @NotBlank(message = "Identifier không được để trống")
    private String identifier;

    @NotBlank(message = "Mã OTP không được để trống")
    private String otpCode;

    // Tùy chọn nhớ thiết bị
    private Boolean rememberDevice = false;
}

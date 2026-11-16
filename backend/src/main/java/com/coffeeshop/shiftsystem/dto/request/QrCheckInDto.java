package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QrCheckInDto {

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Mã QR hoặc Token ca làm việc không được để trống")
    private String qrCode;

    // "CHECK_IN" hoặc "CHECK_OUT" (nếu để trống hệ thống tự phát hiện)
    private String action;

    private String notes;
}

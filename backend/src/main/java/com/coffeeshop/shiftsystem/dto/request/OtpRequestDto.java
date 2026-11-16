package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequestDto {
    @NotBlank(message = "Vui lòng nhập Số điện thoại hoặc Email")
    private String identifier;
}

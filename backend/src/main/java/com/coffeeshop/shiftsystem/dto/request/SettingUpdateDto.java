package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SettingUpdateDto {
    @NotBlank(message = "Setting key không được để trống")
    private String settingKey;

    @NotBlank(message = "Setting value không được để trống")
    private String settingValue;

    private String description;
}

package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class ShiftTemplateDto {

    private Long id;

    @NotBlank(message = "Tên ca không được để trống")
    private String name;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    private LocalTime endTime;

    @NotNull(message = "Số nhân viên tối thiểu không được để trống")
    private Integer minEmployees;

    @NotNull(message = "Hệ số lương không được để trống")
    private BigDecimal salaryMultiplier;

    private Boolean isActive = true;
}

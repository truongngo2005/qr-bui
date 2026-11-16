package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ShiftAssignmentCreateDto {

    @NotNull(message = "Nhân viên không được để trống")
    private Long userId;

    @NotNull(message = "Mẫu ca không được để trống")
    private Long shiftTemplateId;

    @NotNull(message = "Ngày làm việc không được để trống")
    private LocalDate workDate;

    private String notes;
}

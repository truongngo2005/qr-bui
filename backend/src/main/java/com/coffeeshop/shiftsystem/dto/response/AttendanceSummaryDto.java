package com.coffeeshop.shiftsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSummaryDto {
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String position;
    private int totalShifts;
    private BigDecimal totalWorkHours;
    private int onTimeCount;
    private int lateCount;
    private int earlyLeaveCount;
}

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
public class PayrollSummaryDto {
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String position;
    private BigDecimal hourlyRate;
    private BigDecimal totalWorkHours;
    private int shiftCount;
    private int lateCount;
    private BigDecimal baseSalary;
    private BigDecimal allowances;
    private BigDecimal lateFines;
    private BigDecimal finalSalary;
}

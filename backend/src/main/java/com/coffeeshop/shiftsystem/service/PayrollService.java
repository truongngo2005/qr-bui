package com.coffeeshop.shiftsystem.service;

import com.coffeeshop.shiftsystem.dto.response.PayrollSummaryDto;

import java.time.LocalDate;
import java.util.List;

public interface PayrollService {
    List<PayrollSummaryDto> calculatePayroll(LocalDate startDate, LocalDate endDate);
    PayrollSummaryDto calculateEmployeePayroll(Long userId, LocalDate startDate, LocalDate endDate);
}

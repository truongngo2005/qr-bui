package com.coffeeshop.shiftsystem.controller;

import com.coffeeshop.shiftsystem.dto.response.ApiResponse;
import com.coffeeshop.shiftsystem.dto.response.PayrollSummaryDto;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@Tag(name = "Thống kê & Tính lương (Payroll)", description = "Tính lương tự động theo giờ thực tế, phụ cấp và khấu trừ phạt")
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Bảng tổng hợp lương toàn quán theo khoảng thời gian (Admin/Manager)")
    public ResponseEntity<ApiResponse<List<PayrollSummaryDto>>> getPayrollSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<PayrollSummaryDto> payroll = payrollService.calculatePayroll(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(payroll));
    }

    @GetMapping("/my-payroll")
    @Operation(summary = "Xem chi tiết bảng lương cá nhân")
    public ResponseEntity<ApiResponse<PayrollSummaryDto>> getMyPayroll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        PayrollSummaryDto payroll = payrollService.calculateEmployeePayroll(user.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(payroll));
    }
}

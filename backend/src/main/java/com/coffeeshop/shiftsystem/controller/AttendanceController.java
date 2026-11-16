package com.coffeeshop.shiftsystem.controller;

import com.coffeeshop.shiftsystem.dto.request.QrCheckInDto;
import com.coffeeshop.shiftsystem.dto.response.ApiResponse;
import com.coffeeshop.shiftsystem.dto.response.AttendanceSummaryDto;
import com.coffeeshop.shiftsystem.dto.response.QrTokenResponseDto;
import com.coffeeshop.shiftsystem.entity.Attendance;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Chấm công & Mã QR (Attendance)", description = "Mã QR tại quầy thu ngân, quét Check-in / Check-out 1-chạm và lịch sử chấm công")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/current-qr")
    @Operation(summary = "Lấy mã QR động tại quầy thu ngân (Tự động cập nhật)")
    public ResponseEntity<ApiResponse<QrTokenResponseDto>> getCurrentCounterQr() {
        QrTokenResponseDto dto = attendanceService.generateCurrentCounterQr();
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/check-in")
    @Operation(summary = "Quét mã QR để Check-in vào ca hoặc Check-out ra ca (1-chạm)")
    public ResponseEntity<ApiResponse<Attendance>> processQrCheckIn(@Valid @RequestBody QrCheckInDto dto) {
        Attendance attendance = attendanceService.processQrCheckIn(dto);
        String actionType = attendance.getCheckOutTime() != null ? "Check-out ra ca" : "Check-in vào ca";
        return ResponseEntity.ok(ApiResponse.ok(actionType + " thành công!", attendance));
    }

    @GetMapping("/active-status")
    @Operation(summary = "Kiểm tra xem nhân viên hiện tại có đang trong ca làm việc không")
    public ResponseEntity<ApiResponse<Attendance>> getActiveStatus(@AuthenticationPrincipal User user) {
        Attendance active = attendanceService.getActiveCheckIn(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(active));
    }

    @GetMapping("/my-history")
    @Operation(summary = "Lịch sử chấm công của nhân viên đang đăng nhập")
    public ResponseEntity<ApiResponse<List<Attendance>>> getMyHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<Attendance> history = attendanceService.getAttendanceHistory(user.getId(), fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Danh sách chấm công toàn quán (Admin/Manager)")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<Attendance> all = attendanceService.getAllAttendance(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.ok(all));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Báo cáo tổng hợp số giờ làm, đúng giờ, đi muộn của từng nhân viên")
    public ResponseEntity<ApiResponse<List<AttendanceSummaryDto>>> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        List<AttendanceSummaryDto> summary = attendanceService.getAttendanceSummary(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}

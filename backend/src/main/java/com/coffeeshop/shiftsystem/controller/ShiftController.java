package com.coffeeshop.shiftsystem.controller;

import com.coffeeshop.shiftsystem.dto.request.ShiftAssignmentCreateDto;
import com.coffeeshop.shiftsystem.dto.request.ShiftTemplateDto;
import com.coffeeshop.shiftsystem.dto.response.ApiResponse;
import com.coffeeshop.shiftsystem.dto.response.WeeklyScheduleDto;
import com.coffeeshop.shiftsystem.entity.ShiftAssignment;
import com.coffeeshop.shiftsystem.entity.ShiftTemplate;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.service.ShiftService;
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
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@Tag(name = "Quản lý Ca & Phân lịch (Shifts & Scheduling)", description = "Định nghĩa mẫu ca, bảng lịch tuần và phân công nhân viên")
public class ShiftController {

    private final ShiftService shiftService;

    // --- TEMPLATES ---
    @GetMapping("/templates")
    @Operation(summary = "Lấy danh sách các mẫu ca làm việc")
    public ResponseEntity<ApiResponse<List<ShiftTemplate>>> getAllTemplates() {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.getAllTemplates()));
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Tạo mẫu ca mới")
    public ResponseEntity<ApiResponse<ShiftTemplate>> createTemplate(@Valid @RequestBody ShiftTemplateDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo mẫu ca thành công", shiftService.createTemplate(dto)));
    }

    @PutMapping("/templates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cập nhật mẫu ca")
    public ResponseEntity<ApiResponse<ShiftTemplate>> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody ShiftTemplateDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật mẫu ca thành công", shiftService.updateTemplate(id, dto)));
    }

    @DeleteMapping("/templates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Xóa mẫu ca")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable Long id) {
        shiftService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa mẫu ca thành công", null));
    }

    // --- SCHEDULE ---
    @GetMapping("/weekly")
    @Operation(summary = "Lấy bảng phân ca theo tuần (Weekly Board) kèm cảnh báo thiếu nhân sự")
    public ResponseEntity<ApiResponse<WeeklyScheduleDto>> getWeeklySchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate
    ) {
        WeeklyScheduleDto schedule = shiftService.getWeeklySchedule(startDate);
        return ResponseEntity.ok(ApiResponse.ok(schedule));
    }

    @GetMapping("/my-shifts")
    @Operation(summary = "Lấy danh sách các ca làm của nhân viên đang đăng nhập")
    public ResponseEntity<ApiResponse<List<ShiftAssignment>>> getMyShifts(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (startDate == null) startDate = LocalDate.now().minusDays(7);
        if (endDate == null) endDate = LocalDate.now().plusDays(14);
        List<ShiftAssignment> assignments = shiftService.getUserAssignments(user.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(assignments));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Phân công nhân viên vào ca (có kiểm tra chống trùng giờ)")
    public ResponseEntity<ApiResponse<ShiftAssignment>> assignShift(@Valid @RequestBody ShiftAssignmentCreateDto dto) {
        ShiftAssignment assignment = shiftService.assignShift(dto);
        return ResponseEntity.ok(ApiResponse.ok("Xếp ca thành công", assignment));
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Hủy phân công ca làm")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        shiftService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa phân ca thành công", null));
    }
}

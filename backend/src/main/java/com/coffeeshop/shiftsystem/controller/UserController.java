package com.coffeeshop.shiftsystem.controller;

import com.coffeeshop.shiftsystem.dto.request.UserCreateDto;
import com.coffeeshop.shiftsystem.dto.request.UserUpdateDto;
import com.coffeeshop.shiftsystem.dto.response.ApiResponse;
import com.coffeeshop.shiftsystem.dto.response.UserProfileDto;
import com.coffeeshop.shiftsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Quản lý Nhân sự (Employees)", description = "CRUD nhân viên, tìm kiếm, mức lương theo giờ và trạng thái tài khoản")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Lấy danh sách tất cả nhân viên (có tìm kiếm)")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers(@RequestParam(required = false) String search) {
        List<UserProfileDto> users = userService.getAllUsers(search);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Lấy chi tiết nhân viên theo ID")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserById(@PathVariable Long id) {
        UserProfileDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Thêm mới nhân viên với kiểm tra chống trùng SĐT/Email")
    public ResponseEntity<ApiResponse<UserProfileDto>> createUser(@Valid @RequestBody UserCreateDto createDto) {
        UserProfileDto created = userService.createUser(createDto);
        return ResponseEntity.ok(ApiResponse.ok("Thêm mới nhân viên thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cập nhật hồ sơ, chức vụ và mức lương theo giờ")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDto updateDto
    ) {
        UserProfileDto updated = userService.updateUser(id, updateDto);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật nhân viên thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa nhân viên (Chỉ Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa nhân viên thành công", null));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Khóa hoặc mở khóa tài khoản nhân viên")
    public ResponseEntity<ApiResponse<UserProfileDto>> toggleUserStatus(@PathVariable Long id) {
        UserProfileDto updated = userService.toggleUserStatus(id);
        String msg = Boolean.TRUE.equals(updated.getIsActive()) ? "Đã kích hoạt tài khoản" : "Đã tạm khóa tài khoản";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }
}

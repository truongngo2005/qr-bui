package com.coffeeshop.shiftsystem.controller;

import com.coffeeshop.shiftsystem.dto.request.OtpRequestDto;
import com.coffeeshop.shiftsystem.dto.request.OtpVerifyDto;
import com.coffeeshop.shiftsystem.dto.request.QuickLoginDto;
import com.coffeeshop.shiftsystem.dto.response.ApiResponse;
import com.coffeeshop.shiftsystem.dto.response.AuthResponse;
import com.coffeeshop.shiftsystem.dto.response.UserProfileDto;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.service.AuthService;
import com.coffeeshop.shiftsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Xác thực & Thiết bị (Authentication)", description = "APIs đăng nhập bằng SĐT/Email, OTP và lưu thiết bị")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/otp/request")
    @Operation(summary = "Yêu cầu mã OTP qua Email bằng SĐT hoặc Email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestOtp(@Valid @RequestBody OtpRequestDto requestDto) {
        Map<String, Object> result = authService.requestOtp(requestDto);
        return ResponseEntity.ok(ApiResponse.ok("Mã xác thực OTP đã được gửi đến email của bạn", result));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Xác thực OTP và trả về JWT Token")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyDto verifyDto) {
        AuthResponse response = authService.verifyOtp(verifyDto);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công!", response));
    }

    @PostMapping("/quick-login")
    @Operation(summary = "Đăng nhập nhanh 1-chạm cho thiết bị đã lưu")
    public ResponseEntity<ApiResponse<AuthResponse>> quickLogin(@Valid @RequestBody QuickLoginDto quickLoginDto) {
        AuthResponse response = authService.quickLogin(quickLoginDto);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập nhanh thành công!", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUser(@AuthenticationPrincipal User user) {
        UserProfileDto profile = userService.getUserById(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}

package com.coffeeshop.shiftsystem.controller;

import com.coffeeshop.shiftsystem.dto.request.ExchangeActionDto;
import com.coffeeshop.shiftsystem.dto.request.ShiftExchangeCreateDto;
import com.coffeeshop.shiftsystem.dto.response.ApiResponse;
import com.coffeeshop.shiftsystem.entity.ShiftExchangeRequest;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.service.ShiftExchangeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exchange")
@RequiredArgsConstructor
@Tag(name = "Đổi ca & Xin nghỉ phép (Shift Swap & Leave)", description = "Quy trình gửi yêu cầu đổi ca, đồng nghiệp xác nhận và quản lý phê duyệt")
public class ShiftExchangeController {

    private final ShiftExchangeService exchangeService;

    @PostMapping("/requests")
    @Operation(summary = "Nhân viên tạo yêu cầu đổi ca với đồng nghiệp hoặc xin nghỉ phép đột xuất")
    public ResponseEntity<ApiResponse<ShiftExchangeRequest>> createRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ShiftExchangeCreateDto dto
    ) {
        ShiftExchangeRequest req = exchangeService.createRequest(user.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Gửi yêu cầu thành công!", req));
    }

    @PatchMapping("/requests/{id}/peer-action")
    @Operation(summary = "Đồng nghiệp Đồng ý hoặc Từ chối lời mời đổi ca")
    public ResponseEntity<ApiResponse<ShiftExchangeRequest>> handlePeerAction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExchangeActionDto actionDto
    ) {
        ShiftExchangeRequest req = exchangeService.handlePeerAction(id, user.getId(), actionDto);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật phản hồi của bạn", req));
    }

    @PatchMapping("/requests/{id}/manager-approval")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Quản lý phê duyệt (Duyệt xong tự động hoán đổi ca trong CSDL)")
    public ResponseEntity<ApiResponse<ShiftExchangeRequest>> handleManagerApproval(
            @PathVariable Long id,
            @Valid @RequestBody ExchangeActionDto actionDto
    ) {
        ShiftExchangeRequest req = exchangeService.handleManagerApproval(id, actionDto);
        return ResponseEntity.ok(ApiResponse.ok("Đã phê duyệt yêu cầu thành công", req));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Danh sách yêu cầu đổi ca liên quan đến nhân viên hiện tại")
    public ResponseEntity<ApiResponse<List<ShiftExchangeRequest>>> getMyRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(exchangeService.getRequestsForUser(user.getId())));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Danh sách toàn bộ yêu cầu đổi ca & xin nghỉ (Admin/Manager)")
    public ResponseEntity<ApiResponse<List<ShiftExchangeRequest>>> getAllRequests(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(exchangeService.getAllRequests(status)));
    }
}

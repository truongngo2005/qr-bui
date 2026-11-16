package com.coffeeshop.shiftsystem.controller;

import com.coffeeshop.shiftsystem.dto.request.SettingUpdateDto;
import com.coffeeshop.shiftsystem.dto.response.ApiResponse;
import com.coffeeshop.shiftsystem.entity.ShopSetting;
import com.coffeeshop.shiftsystem.service.ShopSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Cấu hình Quán Cà phê (Shop Settings)", description = "Các thiết lập về giờ chấm công, tiền phạt, thông tin thương hiệu")
public class ShopSettingController {

    private final ShopSettingService settingService;

    @GetMapping
    @Operation(summary = "Lấy tất cả cài đặt hệ thống")
    public ResponseEntity<ApiResponse<List<ShopSetting>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getAllSettings()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật giá trị cài đặt (Chỉ Admin)")
    public ResponseEntity<ApiResponse<ShopSetting>> updateSetting(@Valid @RequestBody SettingUpdateDto dto) {
        ShopSetting updated = settingService.updateSetting(dto);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật cài đặt thành công", updated));
    }
}

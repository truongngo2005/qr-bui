package com.coffeeshop.shiftsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrTokenResponseDto {
    private String qrCodePayload;
    private String shopName;
    private String shiftName;
    private String shiftTime;
    private LocalDateTime generatedAt;
    private LocalDateTime expiresAt;
    private int refreshIntervalSeconds;
}

package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShiftExchangeCreateDto {

    @NotNull(message = "Ca làm việc của bạn không được để trống")
    private Long senderAssignmentId;

    // Có thể null nếu là xin nghỉ phép đột xuất
    private Long receiverId;

    // Có thể null nếu đổi ca với nhân viên rảnh hoặc xin nghỉ
    private Long receiverAssignmentId;

    @NotBlank(message = "Loại yêu cầu không được để trống (EXCHANGE hoặc LEAVE)")
    private String requestType; // EXCHANGE, LEAVE

    @NotBlank(message = "Lý do không được để trống")
    private String reason;
}

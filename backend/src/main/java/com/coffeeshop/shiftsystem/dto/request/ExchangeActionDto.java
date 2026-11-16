package com.coffeeshop.shiftsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExchangeActionDto {

    @NotBlank(message = "Hành động không được để trống (ACCEPT, REJECT, APPROVE)")
    private String action; // ACCEPT, REJECT, APPROVE

    private String managerNote;
}

package com.coffeeshop.shiftsystem.dto.request;

import com.coffeeshop.shiftsystem.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserCreateDto {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại Việt Nam không hợp lệ (VD: 0912345678)")
    private String phoneNumber;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    @NotNull(message = "Vai trò không được để trống")
    private Role role;

    @NotBlank(message = "Vị trí/Chức vụ không được để trống")
    private String position;

    @NotNull(message = "Mức lương theo giờ không được để trống")
    private BigDecimal hourlyRate;

    private Boolean isActive = true;
}

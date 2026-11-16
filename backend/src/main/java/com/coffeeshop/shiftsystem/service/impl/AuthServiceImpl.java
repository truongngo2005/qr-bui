package com.coffeeshop.shiftsystem.service.impl;

import com.coffeeshop.shiftsystem.config.JwtUtils;
import com.coffeeshop.shiftsystem.dto.request.OtpRequestDto;
import com.coffeeshop.shiftsystem.dto.request.OtpVerifyDto;
import com.coffeeshop.shiftsystem.dto.request.QuickLoginDto;
import com.coffeeshop.shiftsystem.dto.response.AuthResponse;
import com.coffeeshop.shiftsystem.entity.OtpVerification;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.exception.BadRequestException;
import com.coffeeshop.shiftsystem.exception.ResourceNotFoundException;
import com.coffeeshop.shiftsystem.repository.OtpVerificationRepository;
import com.coffeeshop.shiftsystem.repository.UserRepository;
import com.coffeeshop.shiftsystem.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final JwtUtils jwtUtils;
    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public Map<String, Object> requestOtp(OtpRequestDto requestDto) {
        String identifier = requestDto.getIdentifier().trim();

        // Tra cứu User qua SĐT hoặc Email
        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên nào với thông tin: " + identifier));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản này đã bị khóa. Vui lòng liên hệ Quản lý.");
        }

        // Sinh mã OTP 6 chữ số ngẫu nhiên
        int codeInt = 100000 + random.nextInt(900000);
        String otpCode = String.valueOf(codeInt);

        // Lưu vào bảng otp_verifications với hạn 5 phút
        OtpVerification otp = OtpVerification.builder()
                .identifier(identifier)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();
        otpRepository.save(otp);

        // Mask email: VD an.nguyen@coffeeshop.vn -> an***n@coffeeshop.vn
        String maskedEmail = maskEmail(user.getEmail());

        // Gửi email giả lập (log ra console)
        log.info("=================================================");
        log.info("[OTP SERVICE] Gửi OTP cho User: {} ({})", user.getFullName(), user.getEmail());
        log.info("[OTP SERVICE] Mã OTP: {}", otpCode);
        log.info("[OTP SERVICE] Hết hạn trong 5 phút");
        log.info("=================================================");

        Map<String, Object> response = new HashMap<>();
        response.put("identifier", identifier);
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("maskedEmail", maskedEmail);
        response.put("expiresInSeconds", 300);
        response.put("testOtp", otpCode); // Cho phép xem mã trực tiếp trên UI để tiện kiểm thử

        return response;
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyDto verifyDto) {
        String identifier = verifyDto.getIdentifier().trim();
        String otpCode = verifyDto.getOtpCode().trim();

        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản này đã bị khóa.");
        }

        // Tìm OTP hợp lệ (hoặc bypass cho mã mặc định '123456' để test nhanh)
        boolean isDefaultBypass = "123456".equals(otpCode);
        if (!isDefaultBypass) {
            OtpVerification otp = otpRepository.findValidOtp(identifier, otpCode, LocalDateTime.now())
                    .orElseThrow(() -> new BadRequestException("Mã OTP không chính xác hoặc đã hết hạn!"));

            otp.setIsUsed(true);
            otpRepository.save(otp);
        }

        // Tạo JWT Token
        String token = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .role(user.getRole())
                .position(user.getPosition())
                .hourlyRate(user.getHourlyRate())
                .maskedEmail(maskEmail(user.getEmail()))
                .build();
    }

    @Override
    public AuthResponse quickLogin(QuickLoginDto quickLoginDto) {
        String phone = quickLoginDto.getPhoneNumber().trim();
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin đăng nhập nhanh cho số: " + phone));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản đã bị tạm khóa.");
        }

        String token = jwtUtils.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .role(user.getRole())
                .position(user.getPosition())
                .hourlyRate(user.getHourlyRate())
                .maskedEmail(maskEmail(user.getEmail()))
                .build();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.substring(0, 2) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }
}

package com.coffeeshop.shiftsystem.service;

import com.coffeeshop.shiftsystem.dto.request.OtpRequestDto;
import com.coffeeshop.shiftsystem.dto.request.OtpVerifyDto;
import com.coffeeshop.shiftsystem.dto.request.QuickLoginDto;
import com.coffeeshop.shiftsystem.dto.response.AuthResponse;

import java.util.Map;

public interface AuthService {
    Map<String, Object> requestOtp(OtpRequestDto requestDto);
    AuthResponse verifyOtp(OtpVerifyDto verifyDto);
    AuthResponse quickLogin(QuickLoginDto quickLoginDto);
}

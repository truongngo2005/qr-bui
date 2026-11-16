package com.coffeeshop.shiftsystem.service;

import com.coffeeshop.shiftsystem.dto.request.QrCheckInDto;
import com.coffeeshop.shiftsystem.dto.response.AttendanceSummaryDto;
import com.coffeeshop.shiftsystem.dto.response.QrTokenResponseDto;
import com.coffeeshop.shiftsystem.entity.Attendance;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    QrTokenResponseDto generateCurrentCounterQr();
    Attendance processQrCheckIn(QrCheckInDto dto);
    List<Attendance> getAttendanceHistory(Long userId, LocalDate fromDate, LocalDate toDate);
    List<Attendance> getAllAttendance(LocalDate fromDate, LocalDate toDate);
    List<AttendanceSummaryDto> getAttendanceSummary(LocalDate fromDate, LocalDate toDate);
    Attendance getActiveCheckIn(Long userId);
}

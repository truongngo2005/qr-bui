package com.coffeeshop.shiftsystem.service.impl;

import com.coffeeshop.shiftsystem.dto.response.PayrollSummaryDto;
import com.coffeeshop.shiftsystem.entity.Attendance;
import com.coffeeshop.shiftsystem.entity.ShiftTemplate;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.exception.ResourceNotFoundException;
import com.coffeeshop.shiftsystem.repository.AttendanceRepository;
import com.coffeeshop.shiftsystem.repository.UserRepository;
import com.coffeeshop.shiftsystem.service.PayrollService;
import com.coffeeshop.shiftsystem.service.ShopSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final ShopSettingService shopSettingService;

    @Override
    public List<PayrollSummaryDto> calculatePayroll(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        List<User> activeUsers = userRepository.findAll();
        List<PayrollSummaryDto> results = new ArrayList<>();

        for (User user : activeUsers) {
            results.add(calculateForUser(user, startDate, endDate));
        }

        return results;
    }

    @Override
    public PayrollSummaryDto calculateEmployeePayroll(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên ID: " + userId));

        return calculateForUser(user, startDate, endDate);
    }

    private PayrollSummaryDto calculateForUser(User user, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Attendance> attendances = attendanceRepository.findByUserAndDateRange(user.getId(), start, end);

        BigDecimal totalHours = BigDecimal.ZERO;
        BigDecimal baseSalary = BigDecimal.ZERO;
        int shiftCount = attendances.size();
        int lateCount = 0;

        String finePerLateStr = shopSettingService.getSettingValue("LATE_FINE_PER_MINUTE", "2000");
        BigDecimal finePerLate = new BigDecimal(finePerLateStr).multiply(new BigDecimal("15")); // Ước lượng 15 phút trễ trung bình = 30.000đ/lần
        BigDecimal totalFines = BigDecimal.ZERO;

        for (Attendance att : attendances) {
            BigDecimal hours = att.getWorkHours() != null ? att.getWorkHours() : BigDecimal.ZERO;
            totalHours = totalHours.add(hours);

            // Hệ số lương theo ca (nếu có)
            BigDecimal multiplier = BigDecimal.ONE;
            if (att.getAssignment() != null && att.getAssignment().getShiftTemplate() != null) {
                multiplier = att.getAssignment().getShiftTemplate().getSalaryMultiplier();
            }

            BigDecimal shiftPay = hours.multiply(user.getHourlyRate()).multiply(multiplier);
            baseSalary = baseSalary.add(shiftPay);

            if ("LATE".equalsIgnoreCase(att.getStatus())) {
                lateCount++;
                totalFines = totalFines.add(finePerLate);
            }
        }

        // Phụ cấp chuyên cần: nếu đi làm trên 20 ca và không đi muộn lần nào -> thưởng 300,000 VNĐ
        BigDecimal allowances = BigDecimal.ZERO;
        if (shiftCount >= 20 && lateCount == 0) {
            allowances = allowances.add(new BigDecimal("300000.00"));
        } else if (shiftCount >= 10 && lateCount <= 1) {
            allowances = allowances.add(new BigDecimal("100000.00"));
        }

        BigDecimal finalSalary = baseSalary.add(allowances).subtract(totalFines);
        if (finalSalary.compareTo(BigDecimal.ZERO) < 0) {
            finalSalary = BigDecimal.ZERO;
        }

        return PayrollSummaryDto.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .position(user.getPosition())
                .hourlyRate(user.getHourlyRate())
                .totalWorkHours(totalHours.setScale(2, RoundingMode.HALF_UP))
                .shiftCount(shiftCount)
                .lateCount(lateCount)
                .baseSalary(baseSalary.setScale(0, RoundingMode.HALF_UP))
                .allowances(allowances.setScale(0, RoundingMode.HALF_UP))
                .lateFines(totalFines.setScale(0, RoundingMode.HALF_UP))
                .finalSalary(finalSalary.setScale(0, RoundingMode.HALF_UP))
                .build();
    }
}

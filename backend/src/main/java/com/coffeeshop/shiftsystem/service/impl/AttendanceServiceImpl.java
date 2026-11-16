package com.coffeeshop.shiftsystem.service.impl;

import com.coffeeshop.shiftsystem.dto.request.QrCheckInDto;
import com.coffeeshop.shiftsystem.dto.response.AttendanceSummaryDto;
import com.coffeeshop.shiftsystem.dto.response.QrTokenResponseDto;
import com.coffeeshop.shiftsystem.entity.*;
import com.coffeeshop.shiftsystem.exception.BadRequestException;
import com.coffeeshop.shiftsystem.exception.ResourceNotFoundException;
import com.coffeeshop.shiftsystem.repository.AttendanceRepository;
import com.coffeeshop.shiftsystem.repository.ShiftAssignmentRepository;
import com.coffeeshop.shiftsystem.repository.ShiftTemplateRepository;
import com.coffeeshop.shiftsystem.repository.UserRepository;
import com.coffeeshop.shiftsystem.service.AttendanceService;
import com.coffeeshop.shiftsystem.service.ShopSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ShiftAssignmentRepository assignmentRepository;
    private final ShiftTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final ShopSettingService shopSettingService;

    @Override
    public QrTokenResponseDto generateCurrentCounterQr() {
        LocalTime nowTime = LocalTime.now();
        List<ShiftTemplate> templates = templateRepository.findByIsActiveTrue();

        // Tìm ca phù hợp nhất với thời điểm hiện tại
        ShiftTemplate currentTpl = templates.stream()
                .filter(t -> (!nowTime.isBefore(t.getStartTime().minusMinutes(45)) && !nowTime.isAfter(t.getEndTime())))
                .findFirst()
                .orElse(templates.isEmpty() ? null : templates.get(0));

        String shopName = shopSettingService.getSettingValue("SHOP_NAME", "The Rustic Bean Coffee");
        String refreshSecondsStr = shopSettingService.getSettingValue("QR_REFRESH_INTERVAL_SECONDS", "30");
        int refreshInterval = Integer.parseInt(refreshSecondsStr);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(refreshInterval);

        // Chuỗi payload chứa thông tin mã hóa bảo mật thời gian
        String shiftIdStr = currentTpl != null ? String.valueOf(currentTpl.getId()) : "0";
        String shiftName = currentTpl != null ? currentTpl.getName() : "Ca Linh hoạt";
        String shiftTime = currentTpl != null ? currentTpl.getStartTime() + " - " + currentTpl.getEndTime() : "07:00 - 23:00";

        long epochBlock = System.currentTimeMillis() / (refreshInterval * 1000L);
        String qrPayload = String.format("COFFEE_QR:%s:%d:%d", shiftIdStr, epochBlock, System.currentTimeMillis());

        return QrTokenResponseDto.builder()
                .qrCodePayload(qrPayload)
                .shopName(shopName)
                .shiftName(shiftName)
                .shiftTime(shiftTime)
                .generatedAt(now)
                .expiresAt(expiresAt)
                .refreshIntervalSeconds(refreshInterval)
                .build();
    }

    @Override
    @Transactional
    public Attendance processQrCheckIn(QrCheckInDto dto) {
        String phone = dto.getPhoneNumber().trim();
        User user = userRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin nhân viên với số điện thoại: " + phone));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản nhân viên này đang bị tạm khóa.");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra xem nhân viên đã có ca check-in nào chưa hoàn thành (chưa check-out) hay không
        Optional<Attendance> activeAttendanceOpt = attendanceRepository.findActiveCheckIn(user.getId());

        boolean isExplicitCheckOut = "CHECK_OUT".equalsIgnoreCase(dto.getAction());
        boolean isExplicitCheckIn = "CHECK_IN".equalsIgnoreCase(dto.getAction());

        if (activeAttendanceOpt.isPresent() && !isExplicitCheckIn) {
            // === XỬ LÝ CHECK-OUT (RA CA) ===
            Attendance att = activeAttendanceOpt.get();
            att.setCheckOutTime(now);

            // Tính số giờ làm thực tế
            Duration duration = Duration.between(att.getCheckInTime(), now);
            long minutes = Math.max(0, duration.toMinutes());
            BigDecimal workHours = BigDecimal.valueOf(minutes)
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            att.setWorkHours(workHours);

            // Kiểm tra về sớm nếu có ca phân công
            if (att.getAssignment() != null) {
                ShiftTemplate tpl = att.getAssignment().getShiftTemplate();
                LocalDateTime scheduledEnd = LocalDateTime.of(att.getAssignment().getWorkDate(), tpl.getEndTime());
                if (now.isBefore(scheduledEnd.minusMinutes(10))) {
                    long earlyMin = Duration.between(now, scheduledEnd).toMinutes();
                    att.setStatus("EARLY_LEAVE");
                    String note = "Về sớm " + earlyMin + " phút";
                    att.setNotes(att.getNotes() != null ? att.getNotes() + " | " + note : note);
                }
            }

            if (dto.getNotes() != null && !dto.getNotes().isBlank()) {
                att.setNotes(att.getNotes() != null ? att.getNotes() + " | " + dto.getNotes() : dto.getNotes());
            }

            log.info("[ATTENDANCE] Nhân viên {} ({}) CHECK-OUT lúc {}. Tổng giờ làm: {}h",
                    user.getFullName(), user.getPhoneNumber(), now, workHours);
            return attendanceRepository.save(att);

        } else {
            // === XỬ LÝ CHECK-IN (VÀO CA) ===
            if (activeAttendanceOpt.isPresent() && isExplicitCheckIn) {
                throw new BadRequestException("Bạn đang có ca làm chưa Check-out! Vui lòng Check-out ca trước đó.");
            }

            // Tìm phân công ca hôm nay của nhân viên
            List<ShiftAssignment> todayAssignments = assignmentRepository.findByUserIdAndWorkDate(user.getId(), today);
            ShiftAssignment targetAssignment = null;
            if (!todayAssignments.isEmpty()) {
                // Ưu tiên ca gần thời gian hiện tại nhất
                targetAssignment = todayAssignments.get(0);
            }

            String status = "ON_TIME";
            StringBuilder notes = new StringBuilder();
            if (dto.getNotes() != null && !dto.getNotes().isBlank()) {
                notes.append(dto.getNotes().trim());
            }

            if (targetAssignment != null) {
                ShiftTemplate tpl = targetAssignment.getShiftTemplate();
                LocalDateTime scheduledStart = LocalDateTime.of(today, tpl.getStartTime());
                String graceStr = shopSettingService.getSettingValue("LATE_GRACE_PERIOD_MINUTES", "10");
                int graceMinutes = Integer.parseInt(graceStr);

                if (now.isAfter(scheduledStart.plusMinutes(graceMinutes))) {
                    long lateMinutes = Duration.between(scheduledStart, now).toMinutes();
                    status = "LATE";
                    String lateNote = "Đi muộn " + lateMinutes + " phút (Ca bắt đầu lúc " + tpl.getStartTime() + ")";
                    if (notes.length() > 0) notes.append(" | ");
                    notes.append(lateNote);
                }
            }

            Attendance newAttendance = Attendance.builder()
                    .user(user)
                    .assignment(targetAssignment)
                    .checkInTime(now)
                    .checkOutTime(null)
                    .workHours(BigDecimal.ZERO)
                    .status(status)
                    .notes(notes.length() > 0 ? notes.toString() : "Check-in QR tại quầy")
                    .qrToken(dto.getQrCode())
                    .build();

            log.info("[ATTENDANCE] Nhân viên {} ({}) CHECK-IN thành công lúc {}. Trạng thái: {}",
                    user.getFullName(), user.getPhoneNumber(), now, status);
            return attendanceRepository.save(newAttendance);
        }
    }

    @Override
    public List<Attendance> getAttendanceHistory(Long userId, LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().minusDays(30);
        if (toDate == null) toDate = LocalDate.now();

        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);
        return attendanceRepository.findByUserAndDateRange(userId, start, end);
    }

    @Override
    public List<Attendance> getAllAttendance(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().minusDays(7);
        if (toDate == null) toDate = LocalDate.now();

        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);
        return attendanceRepository.findAllByDateRange(start, end);
    }

    @Override
    public List<AttendanceSummaryDto> getAttendanceSummary(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().minusDays(30);
        if (toDate == null) toDate = LocalDate.now();

        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);
        List<Attendance> attendances = attendanceRepository.findAllByDateRange(start, end);

        Map<Long, List<Attendance>> userMap = new HashMap<>();
        for (Attendance att : attendances) {
            userMap.computeIfAbsent(att.getUser().getId(), k -> new ArrayList<>()).add(att);
        }

        List<AttendanceSummaryDto> summaries = new ArrayList<>();
        for (Map.Entry<Long, List<Attendance>> entry : userMap.entrySet()) {
            List<Attendance> list = entry.getValue();
            User u = list.get(0).getUser();

            BigDecimal totalHours = BigDecimal.ZERO;
            int onTime = 0;
            int late = 0;
            int early = 0;

            for (Attendance a : list) {
                if (a.getWorkHours() != null) {
                    totalHours = totalHours.add(a.getWorkHours());
                }
                if ("ON_TIME".equalsIgnoreCase(a.getStatus())) onTime++;
                else if ("LATE".equalsIgnoreCase(a.getStatus())) late++;
                else if ("EARLY_LEAVE".equalsIgnoreCase(a.getStatus())) early++;
            }

            summaries.add(AttendanceSummaryDto.builder()
                    .userId(u.getId())
                    .fullName(u.getFullName())
                    .phoneNumber(u.getPhoneNumber())
                    .position(u.getPosition())
                    .totalShifts(list.size())
                    .totalWorkHours(totalHours)
                    .onTimeCount(onTime)
                    .lateCount(late)
                    .earlyLeaveCount(early)
                    .build());
        }

        return summaries;
    }

    @Override
    public Attendance getActiveCheckIn(Long userId) {
        return attendanceRepository.findActiveCheckIn(userId).orElse(null);
    }
}

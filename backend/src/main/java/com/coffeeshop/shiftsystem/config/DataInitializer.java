package com.coffeeshop.shiftsystem.config;

import com.coffeeshop.shiftsystem.entity.*;
import com.coffeeshop.shiftsystem.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ShiftTemplateRepository shiftTemplateRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ShopSettingRepository shopSettingRepository;
    private final ShiftExchangeRequestRepository exchangeRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedSettings();
        seedTemplates();
        seedUsers();
        seedAssignmentsAndAttendance();
        log.info(">>> Khởi tạo dữ liệu mẫu thành công cho Hệ thống Quán Cà phê! <<<");
    }

    private void seedSettings() {
        if (shopSettingRepository.count() == 0) {
            shopSettingRepository.saveAll(List.of(
                    ShopSetting.builder().settingKey("SHOP_NAME").settingValue("The Rustic Bean Coffee").description("Tên quán").build(),
                    ShopSetting.builder().settingKey("SHOP_ADDRESS").settingValue("123 Phố Tràng Tiền, Hoàn Kiếm, Hà Nội").description("Địa chỉ").build(),
                    ShopSetting.builder().settingKey("EARLY_CHECKIN_MINUTES").settingValue("30").description("Phút cho phép check-in sớm").build(),
                    ShopSetting.builder().settingKey("LATE_GRACE_PERIOD_MINUTES").settingValue("10").description("Thời gian ân hạn trễ (phút)").build(),
                    ShopSetting.builder().settingKey("LATE_FINE_PER_MINUTE").settingValue("2000").description("Mức phạt trễ (VNĐ/phút)").build(),
                    ShopSetting.builder().settingKey("QR_REFRESH_INTERVAL_SECONDS").settingValue("30").description("Chu kỳ đổi QR (giây)").build()
            ));
        }
    }

    private void seedTemplates() {
        if (shiftTemplateRepository.count() == 0) {
            shiftTemplateRepository.saveAll(List.of(
                    ShiftTemplate.builder().name("Ca Sáng (Mở cửa)").startTime(LocalTime.of(6, 30)).endTime(LocalTime.of(12, 30)).minEmployees(3).salaryMultiplier(new BigDecimal("1.00")).isActive(true).build(),
                    ShiftTemplate.builder().name("Ca Chiều (Cao điểm)").startTime(LocalTime.of(12, 30)).endTime(LocalTime.of(18, 0)).minEmployees(3).salaryMultiplier(new BigDecimal("1.00")).isActive(true).build(),
                    ShiftTemplate.builder().name("Ca Tối (Đóng cửa)").startTime(LocalTime.of(18, 0)).endTime(LocalTime.of(23, 0)).minEmployees(4).salaryMultiplier(new BigDecimal("1.10")).isActive(true).build(),
                    ShiftTemplate.builder().name("Ca Part-time Linh hoạt").startTime(LocalTime.of(8, 0)).endTime(LocalTime.of(13, 0)).minEmployees(2).salaryMultiplier(new BigDecimal("1.05")).isActive(true).build()
            ));
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            String defaultPwd = passwordEncoder.encode("Coffee@123");
            userRepository.saveAll(List.of(
                    User.builder().fullName("Võ Minh Trí").phoneNumber("0901234567").email("admin@coffeeshop.vn").passwordHash(defaultPwd).role(Role.ADMIN).position("Chủ quán / Admin").hourlyRate(new BigDecimal("50000.00")).isActive(true).build(),
                    User.builder().fullName("Hoàng Thùy Linh").phoneNumber("0909876543").email("manager@coffeeshop.vn").passwordHash(defaultPwd).role(Role.MANAGER).position("Cửa hàng trưởng").hourlyRate(new BigDecimal("40000.00")).isActive(true).build(),
                    User.builder().fullName("Nguyễn Văn An").phoneNumber("0912345678").email("an.nguyen@coffeeshop.vn").passwordHash(defaultPwd).role(Role.EMPLOYEE).position("Pha chế (Barista)").hourlyRate(new BigDecimal("30000.00")).isActive(true).build(),
                    User.builder().fullName("Trần Thái Bình").phoneNumber("0912345679").email("binh.tran@coffeeshop.vn").passwordHash(defaultPwd).role(Role.EMPLOYEE).position("Thu ngân (Cashier)").hourlyRate(new BigDecimal("27000.00")).isActive(true).build(),
                    User.builder().fullName("Lê Thị Mỹ Cúc").phoneNumber("0912345680").email("cuc.le@coffeeshop.vn").passwordHash(defaultPwd).role(Role.EMPLOYEE).position("Phục vụ (Waitress)").hourlyRate(new BigDecimal("25000.00")).isActive(true).build(),
                    User.builder().fullName("Phạm Quốc Dũng").phoneNumber("0912345681").email("dung.pham@coffeeshop.vn").passwordHash(defaultPwd).role(Role.EMPLOYEE).position("Bảo vệ & Hướng dẫn xe").hourlyRate(new BigDecimal("26000.00")).isActive(true).build()
            ));
        }
    }

    private void seedAssignmentsAndAttendance() {
        if (shiftAssignmentRepository.count() == 0) {
            User an = userRepository.findByPhoneNumber("0912345678").orElse(null);
            User binh = userRepository.findByPhoneNumber("0912345679").orElse(null);
            User cuc = userRepository.findByPhoneNumber("0912345680").orElse(null);
            User dung = userRepository.findByPhoneNumber("0912345681").orElse(null);

            List<ShiftTemplate> templates = shiftTemplateRepository.findAll();
            if (templates.size() >= 3 && an != null && binh != null) {
                ShiftTemplate morning = templates.get(0);
                ShiftTemplate afternoon = templates.get(1);
                ShiftTemplate night = templates.get(2);

                LocalDate today = LocalDate.now();

                // Hôm nay
                ShiftAssignment a1 = shiftAssignmentRepository.save(ShiftAssignment.builder().user(an).shiftTemplate(morning).workDate(today).status("ASSIGNED").notes("Pha chế mở ca sáng").build());
                ShiftAssignment a2 = shiftAssignmentRepository.save(ShiftAssignment.builder().user(binh).shiftTemplate(morning).workDate(today).status("ASSIGNED").notes("Thu ngân mở két").build());
                shiftAssignmentRepository.save(ShiftAssignment.builder().user(cuc).shiftTemplate(morning).workDate(today).status("ASSIGNED").notes("Phục vụ tầng 1").build());
                shiftAssignmentRepository.save(ShiftAssignment.builder().user(dung).shiftTemplate(morning).workDate(today).status("ASSIGNED").notes("Trông xe").build());

                // Ngày mai
                ShiftAssignment aTomorrow1 = shiftAssignmentRepository.save(ShiftAssignment.builder().user(an).shiftTemplate(afternoon).workDate(today.plusDays(1)).status("ASSIGNED").notes("Pha chế ca chiều").build());
                ShiftAssignment aTomorrow2 = shiftAssignmentRepository.save(ShiftAssignment.builder().user(cuc).shiftTemplate(night).workDate(today.plusDays(1)).status("ASSIGNED").notes("Phục vụ ca tối").build());

                // Seed lịch sử chấm công
                LocalDateTime yesterdayMorning = LocalDateTime.of(today.minusDays(1), LocalTime.of(6, 25));
                LocalDateTime yesterdayEnd = LocalDateTime.of(today.minusDays(1), LocalTime.of(12, 30));
                attendanceRepository.save(Attendance.builder().user(an).assignment(null).checkInTime(yesterdayMorning).checkOutTime(yesterdayEnd).workHours(new BigDecimal("6.08")).status("ON_TIME").notes("Đúng giờ").build());
                attendanceRepository.save(Attendance.builder().user(binh).assignment(null).checkInTime(yesterdayMorning.plusMinutes(20)).checkOutTime(yesterdayEnd).workHours(new BigDecimal("5.75")).status("LATE").notes("Trễ 15 phút do tắc đường").build());

                // Seed yêu cầu đổi ca mẫu
                exchangeRequestRepository.save(ShiftExchangeRequest.builder()
                        .sender(an)
                        .receiver(cuc)
                        .senderAssignment(aTomorrow1)
                        .receiverAssignment(aTomorrow2)
                        .requestType("EXCHANGE")
                        .status("PENDING")
                        .reason("Em có việc gia đình đột xuất buổi chiều mai, muốn đổi sang ca tối với bạn Cúc ạ.")
                        .build());
            }
        }
    }
}

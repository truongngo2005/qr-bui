package com.coffeeshop.shiftsystem.service.impl;

import com.coffeeshop.shiftsystem.dto.request.ShiftAssignmentCreateDto;
import com.coffeeshop.shiftsystem.dto.request.ShiftTemplateDto;
import com.coffeeshop.shiftsystem.dto.response.WeeklyScheduleDto;
import com.coffeeshop.shiftsystem.entity.ShiftAssignment;
import com.coffeeshop.shiftsystem.entity.ShiftTemplate;
import com.coffeeshop.shiftsystem.entity.User;
import com.coffeeshop.shiftsystem.exception.BadRequestException;
import com.coffeeshop.shiftsystem.exception.ResourceNotFoundException;
import com.coffeeshop.shiftsystem.repository.ShiftAssignmentRepository;
import com.coffeeshop.shiftsystem.repository.ShiftTemplateRepository;
import com.coffeeshop.shiftsystem.repository.UserRepository;
import com.coffeeshop.shiftsystem.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private final ShiftTemplateRepository templateRepository;
    private final ShiftAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    @Override
    public List<ShiftTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Override
    @Transactional
    public ShiftTemplate createTemplate(ShiftTemplateDto dto) {
        ShiftTemplate template = ShiftTemplate.builder()
                .name(dto.getName().trim())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .minEmployees(dto.getMinEmployees())
                .salaryMultiplier(dto.getSalaryMultiplier())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return templateRepository.save(template);
    }

    @Override
    @Transactional
    public ShiftTemplate updateTemplate(Long id, ShiftTemplateDto dto) {
        ShiftTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu ca ID: " + id));

        template.setName(dto.getName().trim());
        template.setStartTime(dto.getStartTime());
        template.setEndTime(dto.getEndTime());
        template.setMinEmployees(dto.getMinEmployees());
        template.setSalaryMultiplier(dto.getSalaryMultiplier());
        if (dto.getIsActive() != null) {
            template.setIsActive(dto.getIsActive());
        }

        return templateRepository.save(template);
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        ShiftTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu ca ID: " + id));
        templateRepository.delete(template);
    }

    @Override
    public WeeklyScheduleDto getWeeklySchedule(LocalDate startDate) {
        if (startDate == null) {
            startDate = LocalDate.now().with(DayOfWeek.MONDAY);
        }
        LocalDate endDate = startDate.plusDays(6);

        List<ShiftTemplate> templates = templateRepository.findByIsActiveTrue();
        List<ShiftAssignment> assignments = assignmentRepository.findByWorkDateBetweenOrderByWorkDateAsc(startDate, endDate);

        Map<String, List<ShiftAssignment>> assignmentMap = new HashMap<>();
        for (ShiftAssignment sa : assignments) {
            String key = sa.getWorkDate().toString() + "_" + sa.getShiftTemplate().getId();
            assignmentMap.computeIfAbsent(key, k -> new ArrayList<>()).add(sa);
        }

        List<WeeklyScheduleDto.DayScheduleDto> daySchedules = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            String dayOfWeekName = getVietnameseDayOfWeek(currentDate.getDayOfWeek());

            List<WeeklyScheduleDto.ShiftSlotDto> slots = new ArrayList<>();
            for (ShiftTemplate tpl : templates) {
                String key = currentDate.toString() + "_" + tpl.getId();
                List<ShiftAssignment> slotAssignments = assignmentMap.getOrDefault(key, Collections.emptyList());
                int count = slotAssignments.size();
                boolean isUnderstaffed = count < tpl.getMinEmployees();

                slots.add(WeeklyScheduleDto.ShiftSlotDto.builder()
                        .template(tpl)
                        .assignments(slotAssignments)
                        .currentCount(count)
                        .minEmployees(tpl.getMinEmployees())
                        .isUnderstaffed(isUnderstaffed)
                        .build());
            }

            daySchedules.add(WeeklyScheduleDto.DayScheduleDto.builder()
                    .date(currentDate)
                    .dayOfWeek(dayOfWeekName)
                    .slots(slots)
                    .build());
        }

        return WeeklyScheduleDto.builder()
                .startDate(startDate)
                .endDate(endDate)
                .templates(templates)
                .days(daySchedules)
                .build();
    }

    @Override
    public List<ShiftAssignment> getUserAssignments(Long userId, LocalDate startDate, LocalDate endDate) {
        return assignmentRepository.findByUserIdAndWorkDateBetweenOrderByWorkDateAsc(userId, startDate, endDate);
    }

    @Override
    @Transactional
    public ShiftAssignment assignShift(ShiftAssignmentCreateDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với ID: " + dto.getUserId()));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Không thể xếp ca cho nhân viên đang bị khóa tài khoản!");
        }

        ShiftTemplate newTemplate = templateRepository.findById(dto.getShiftTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu ca ID: " + dto.getShiftTemplateId()));

        // Kiểm tra xem nhân viên đã được xếp vào chính ca này chưa
        Optional<ShiftAssignment> existing = assignmentRepository.findByUserIdAndShiftTemplateIdAndWorkDate(
                user.getId(), newTemplate.getId(), dto.getWorkDate()
        );
        if (existing.isPresent()) {
            throw new BadRequestException("Nhân viên " + user.getFullName() + " đã được phân công vào ca này rồi!");
        }

        // Cảnh báo / Ngăn chặn xung đột giờ làm: Kiểm tra tất cả ca cùng ngày của nhân viên
        List<ShiftAssignment> dayAssignments = assignmentRepository.findByUserIdAndWorkDate(user.getId(), dto.getWorkDate());
        for (ShiftAssignment sa : dayAssignments) {
            ShiftTemplate otherTpl = sa.getShiftTemplate();
            // Kiểm tra trùng giờ
            boolean isOverlap = !(newTemplate.getEndTime().isBefore(otherTpl.getStartTime()) ||
                                  newTemplate.getStartTime().isAfter(otherTpl.getEndTime()) ||
                                  newTemplate.getEndTime().equals(otherTpl.getStartTime()) ||
                                  newTemplate.getStartTime().equals(otherTpl.getEndTime()));
            if (isOverlap) {
                throw new BadRequestException("Xung đột lịch làm việc! " + user.getFullName() +
                        " đã có ca (" + otherTpl.getName() + ": " + otherTpl.getStartTime() + " - " + otherTpl.getEndTime() +
                        ") trùng giờ với ca muốn xếp (" + newTemplate.getStartTime() + " - " + newTemplate.getEndTime() + ").");
            }
        }

        ShiftAssignment assignment = ShiftAssignment.builder()
                .user(user)
                .shiftTemplate(newTemplate)
                .workDate(dto.getWorkDate())
                .status("ASSIGNED")
                .notes(dto.getNotes())
                .build();

        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        ShiftAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phân công ca ID: " + assignmentId));
        assignmentRepository.delete(assignment);
    }

    private String getVietnameseDayOfWeek(DayOfWeek dow) {
        return switch (dow) {
            case MONDAY -> "Thứ Hai";
            case TUESDAY -> "Thứ Ba";
            case WEDNESDAY -> "Thứ Tư";
            case THURSDAY -> "Thứ Năm";
            case FRIDAY -> "Thứ Sáu";
            case SATURDAY -> "Thứ Bảy";
            case SUNDAY -> "Chủ Nhật";
        };
    }
}

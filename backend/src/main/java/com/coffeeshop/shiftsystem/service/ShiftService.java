package com.coffeeshop.shiftsystem.service;

import com.coffeeshop.shiftsystem.dto.request.ShiftAssignmentCreateDto;
import com.coffeeshop.shiftsystem.dto.request.ShiftTemplateDto;
import com.coffeeshop.shiftsystem.dto.response.WeeklyScheduleDto;
import com.coffeeshop.shiftsystem.entity.ShiftAssignment;
import com.coffeeshop.shiftsystem.entity.ShiftTemplate;

import java.time.LocalDate;
import java.util.List;

public interface ShiftService {
    List<ShiftTemplate> getAllTemplates();
    ShiftTemplate createTemplate(ShiftTemplateDto dto);
    ShiftTemplate updateTemplate(Long id, ShiftTemplateDto dto);
    void deleteTemplate(Long id);

    WeeklyScheduleDto getWeeklySchedule(LocalDate startDate);
    List<ShiftAssignment> getUserAssignments(Long userId, LocalDate startDate, LocalDate endDate);
    ShiftAssignment assignShift(ShiftAssignmentCreateDto dto);
    void deleteAssignment(Long assignmentId);
}

package com.coffeeshop.shiftsystem.dto.response;

import com.coffeeshop.shiftsystem.entity.ShiftAssignment;
import com.coffeeshop.shiftsystem.entity.ShiftTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyScheduleDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ShiftTemplate> templates;
    private List<DayScheduleDto> days;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DayScheduleDto {
        private LocalDate date;
        private String dayOfWeek;
        private List<ShiftSlotDto> slots;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShiftSlotDto {
        private ShiftTemplate template;
        private List<ShiftAssignment> assignments;
        private int currentCount;
        private int minEmployees;
        private boolean isUnderstaffed;
    }
}

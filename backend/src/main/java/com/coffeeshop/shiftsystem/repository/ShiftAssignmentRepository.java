package com.coffeeshop.shiftsystem.repository;

import com.coffeeshop.shiftsystem.entity.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {

    List<ShiftAssignment> findByWorkDateBetweenOrderByWorkDateAsc(LocalDate startDate, LocalDate endDate);

    List<ShiftAssignment> findByUserIdAndWorkDateBetweenOrderByWorkDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    List<ShiftAssignment> findByUserIdAndWorkDate(Long userId, LocalDate workDate);

    Optional<ShiftAssignment> findByUserIdAndShiftTemplateIdAndWorkDate(Long userId, Long shiftTemplateId, LocalDate workDate);

    @Query("SELECT sa FROM ShiftAssignment sa WHERE sa.workDate = :workDate " +
           "AND sa.status = 'ASSIGNED'")
    List<ShiftAssignment> findActiveAssignmentsOnDate(@Param("workDate") LocalDate workDate);
}

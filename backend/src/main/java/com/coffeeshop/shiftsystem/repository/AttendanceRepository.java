package com.coffeeshop.shiftsystem.repository;

import com.coffeeshop.shiftsystem.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT a FROM Attendance a WHERE a.user.id = :userId " +
           "AND a.checkInTime BETWEEN :startTime AND :endTime " +
           "ORDER BY a.checkInTime DESC")
    List<Attendance> findByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT a FROM Attendance a WHERE a.checkInTime BETWEEN :startTime AND :endTime " +
           "ORDER BY a.checkInTime DESC")
    List<Attendance> findAllByDateRange(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT a FROM Attendance a WHERE a.user.id = :userId AND a.checkOutTime IS NULL " +
           "ORDER BY a.checkInTime DESC LIMIT 1")
    Optional<Attendance> findActiveCheckIn(@Param("userId") Long userId);
}

package com.coffeeshop.shiftsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignment_id")
    private ShiftAssignment assignment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "work_hours", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal workHours = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "ON_TIME"; // ON_TIME, LATE, EARLY_LEAVE, ABSENT

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "qr_token")
    private String qrToken;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

package com.coffeeshop.shiftsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shift_exchange_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftExchangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id")
    private User receiver; // NULL if LEAVE request

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_assignment_id", nullable = false)
    private ShiftAssignment senderAssignment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_assignment_id")
    private ShiftAssignment receiverAssignment;

    @Column(name = "request_type", nullable = false, length = 20)
    @Builder.Default
    private String requestType = "EXCHANGE"; // EXCHANGE, LEAVE

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, APPROVED, REJECTED, CANCELLED

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "manager_note", columnDefinition = "TEXT")
    private String managerNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

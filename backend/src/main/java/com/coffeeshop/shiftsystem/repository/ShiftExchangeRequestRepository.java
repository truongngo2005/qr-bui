package com.coffeeshop.shiftsystem.repository;

import com.coffeeshop.shiftsystem.entity.ShiftExchangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftExchangeRequestRepository extends JpaRepository<ShiftExchangeRequest, Long> {

    List<ShiftExchangeRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<ShiftExchangeRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    List<ShiftExchangeRequest> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT r FROM ShiftExchangeRequest r WHERE r.sender.id = :userId OR r.receiver.id = :userId " +
           "ORDER BY r.createdAt DESC")
    List<ShiftExchangeRequest> findByUserInvolved(@Param("userId") Long userId);
}

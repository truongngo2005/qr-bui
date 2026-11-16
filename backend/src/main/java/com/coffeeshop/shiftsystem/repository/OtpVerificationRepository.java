package com.coffeeshop.shiftsystem.repository;

import com.coffeeshop.shiftsystem.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    @Query("SELECT o FROM OtpVerification o WHERE o.identifier = :identifier " +
           "AND o.otpCode = :otpCode AND o.isUsed = false AND o.expiresAt > :now " +
           "ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpVerification> findValidOtp(
            @Param("identifier") String identifier,
            @Param("otpCode") String otpCode,
            @Param("now") LocalDateTime now
    );

    @Query("SELECT o FROM OtpVerification o WHERE o.identifier = :identifier " +
           "ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpVerification> findLatestByIdentifier(@Param("identifier") String identifier);
}

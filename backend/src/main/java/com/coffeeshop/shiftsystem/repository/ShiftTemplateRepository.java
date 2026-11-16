package com.coffeeshop.shiftsystem.repository;

import com.coffeeshop.shiftsystem.entity.ShiftTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftTemplateRepository extends JpaRepository<ShiftTemplate, Long> {
    List<ShiftTemplate> findByIsActiveTrue();
}

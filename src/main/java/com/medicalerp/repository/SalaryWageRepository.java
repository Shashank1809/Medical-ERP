package com.medicalerp.repository;

import com.medicalerp.model.SalaryWage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SalaryWageRepository extends JpaRepository<SalaryWage, Long> {
    List<SalaryWage> findByMonthAndYear(String month, Integer year);
    List<SalaryWage> findByEmployeeNameContainingIgnoreCase(String name);
}
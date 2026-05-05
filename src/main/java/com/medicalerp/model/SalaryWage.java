package com.medicalerp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;

@Entity @Table(name = "salary_wages")
@Data @NoArgsConstructor @AllArgsConstructor
public class SalaryWage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String employeeName;
    private String employeeCode;
    private String designation;
    private String department;
    private BigDecimal basicSalary;
    private BigDecimal hra = BigDecimal.ZERO;
    private BigDecimal allowances = BigDecimal.ZERO;
    private BigDecimal deductions = BigDecimal.ZERO;
    private BigDecimal netSalary;
    private String month;
    private Integer year;
    private LocalDate paymentDate;
    private String paymentMode;
    private String status = "PENDING";
    private LocalDateTime createdAt = LocalDateTime.now();
}
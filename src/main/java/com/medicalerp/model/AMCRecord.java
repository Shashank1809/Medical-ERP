package com.medicalerp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;

@Entity @Table(name = "amc_records")
@Data @NoArgsConstructor @AllArgsConstructor
public class AMCRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String amcNumber;
    @ManyToOne @JoinColumn(name = "customer_id")
    private Customer customer;
    @ManyToOne @JoinColumn(name = "product_id")
    private Product product;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal amcAmount;
    private String visitFrequency;
    private Integer visitsCompleted = 0;
    private Integer totalVisits;
    private String status = "ACTIVE";
    private String technicianName;
    private String notes;
    private LocalDateTime createdAt = LocalDateTime.now();
}
package com.medicalerp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;

@Entity @Table(name = "customer_services")
@Data @NoArgsConstructor @AllArgsConstructor
public class CustomerService {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "customer_id")
    private Customer customer;
    private LocalDate serviceDate;
    private String serviceType;
    private String description;
    private String technicianName;
    private String status = "PENDING";
    private BigDecimal amount;
    private String remarks;
    private LocalDateTime createdAt = LocalDateTime.now();
}
package com.medicalerp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;

@Entity @Table(name = "quotations")
@Data @NoArgsConstructor @AllArgsConstructor
public class Quotation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String quotationNumber;
    @ManyToOne @JoinColumn(name = "customer_id")
    private Customer customer;
    private LocalDate quotationDate;
    private LocalDate validUntil;
    private BigDecimal totalAmount;
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal gstAmount = BigDecimal.ZERO;
    private BigDecimal grandTotal;
    private String status = "DRAFT";
    private String termsConditions;
    private String notes;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL)
    private List<QuotationItem> items;
}
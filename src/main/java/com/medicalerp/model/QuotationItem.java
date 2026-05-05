package com.medicalerp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "quotation_items")
@Data @NoArgsConstructor @AllArgsConstructor
public class QuotationItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "quotation_id")
    private Quotation quotation;
    @ManyToOne @JoinColumn(name = "product_id")
    private Product product;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
}
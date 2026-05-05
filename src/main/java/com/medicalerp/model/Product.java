package com.medicalerp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productCode;
    @Column(nullable = false)
    private String name;
    @ManyToOne @JoinColumn(name = "category_id")
    private ProductCategory category;
    private String description;
    private String unit;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity = 0;
    private Integer minStock = 0;
    private String hsnCode;
    private BigDecimal gstRate;
    private String status = "ACTIVE";
    private LocalDateTime createdAt = LocalDateTime.now();
}
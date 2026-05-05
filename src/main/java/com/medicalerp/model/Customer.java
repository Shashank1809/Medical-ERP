package com.medicalerp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "customers")
@Data @NoArgsConstructor @AllArgsConstructor
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String customerCode;
    @Column(nullable = false)
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String gstNumber;
    private String status = "ACTIVE";
    private LocalDateTime createdAt = LocalDateTime.now();
}
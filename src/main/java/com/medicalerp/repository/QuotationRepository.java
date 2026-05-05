package com.medicalerp.repository;

import com.medicalerp.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findByCustomerId(Long customerId);
    List<Quotation> findByStatus(String status);
}
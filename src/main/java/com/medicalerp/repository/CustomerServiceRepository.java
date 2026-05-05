package com.medicalerp.repository;

import com.medicalerp.model.CustomerService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CustomerServiceRepository extends JpaRepository<CustomerService, Long> {
    List<CustomerService> findByCustomerId(Long customerId);
    List<CustomerService> findByStatus(String status);
}
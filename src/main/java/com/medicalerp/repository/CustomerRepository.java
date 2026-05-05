package com.medicalerp.repository;

import com.medicalerp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByNameContainingIgnoreCaseOrCityContainingIgnoreCase(String name, String city);
    List<Customer> findByStatus(String status);
}
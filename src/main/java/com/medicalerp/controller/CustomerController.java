package com.medicalerp.controller;

import com.medicalerp.model.Customer;
import com.medicalerp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired private CustomerRepository repo;

    @GetMapping
    public List<Customer> getAll(@RequestParam(required = false) String search,
                                 @RequestParam(required = false) String status) {
        if (search != null && !search.isEmpty())
            return repo.findByNameContainingIgnoreCaseOrCityContainingIgnoreCase(search, search);
        if (status != null && !status.isEmpty())
            return repo.findByStatus(status);
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isEmpty()) {
            customer.setCustomerCode("CUST-" + System.currentTimeMillis());
        }
        return repo.save(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer customer) {
        return repo.findById(id).map(existing -> {
            customer.setId(id);
            return ResponseEntity.ok(repo.save(customer));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
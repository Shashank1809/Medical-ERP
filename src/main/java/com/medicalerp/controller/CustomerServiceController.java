package com.medicalerp.controller;

import com.medicalerp.model.CustomerService;
import com.medicalerp.repository.CustomerServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customer-services")
public class CustomerServiceController {

    @Autowired private CustomerServiceRepository repo;

    @GetMapping
    public List<CustomerService> getAll(@RequestParam(required = false) Long customerId,
                                        @RequestParam(required = false) String status) {
        if (customerId != null) return repo.findByCustomerId(customerId);
        if (status != null && !status.isEmpty()) return repo.findByStatus(status);
        return repo.findAll();
    }

    @PostMapping
    public CustomerService create(@RequestBody CustomerService service) {
        return repo.save(service);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerService> update(@PathVariable Long id, @RequestBody CustomerService service) {
        return repo.findById(id).map(existing -> {
            service.setId(id);
            return ResponseEntity.ok(repo.save(service));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
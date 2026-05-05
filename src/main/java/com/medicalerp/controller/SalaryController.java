package com.medicalerp.controller;

import com.medicalerp.model.SalaryWage;
import com.medicalerp.repository.SalaryWageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/salary")
public class SalaryController {

    @Autowired private SalaryWageRepository repo;

    @GetMapping
    public List<SalaryWage> getAll(@RequestParam(required = false) String month,
                                   @RequestParam(required = false) Integer year,
                                   @RequestParam(required = false) String search) {
        if (month != null && year != null) return repo.findByMonthAndYear(month, year);
        if (search != null && !search.isEmpty()) return repo.findByEmployeeNameContainingIgnoreCase(search);
        return repo.findAll();
    }

    @PostMapping
    public SalaryWage create(@RequestBody SalaryWage wage) {
        if (wage.getEmployeeCode() == null || wage.getEmployeeCode().isEmpty()) {
            wage.setEmployeeCode("EMP-" + System.currentTimeMillis());
        }
        return repo.save(wage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaryWage> update(@PathVariable Long id, @RequestBody SalaryWage wage) {
        return repo.findById(id).map(e -> { wage.setId(id); return ResponseEntity.ok(repo.save(wage)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
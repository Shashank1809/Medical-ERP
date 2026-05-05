package com.medicalerp.controller;

import com.medicalerp.model.AMCRecord;
import com.medicalerp.repository.AMCRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/amc")
public class AMCController {

    @Autowired private AMCRecordRepository repo;

    @GetMapping
    public List<AMCRecord> getAll(@RequestParam(required = false) Long customerId,
                                  @RequestParam(required = false) String status) {
        if (customerId != null) return repo.findByCustomerId(customerId);
        if (status != null && !status.isEmpty()) return repo.findByStatus(status);
        return repo.findAll();
    }

    @PostMapping
    public AMCRecord create(@RequestBody AMCRecord amc) {
        if (amc.getAmcNumber() == null || amc.getAmcNumber().isEmpty()) {
            amc.setAmcNumber("AMC-" + System.currentTimeMillis());
        }
        return repo.save(amc);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AMCRecord> update(@PathVariable Long id, @RequestBody AMCRecord amc) {
        return repo.findById(id).map(e -> { amc.setId(id); return ResponseEntity.ok(repo.save(amc)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
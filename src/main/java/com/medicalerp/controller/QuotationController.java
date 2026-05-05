package com.medicalerp.controller;

import com.medicalerp.model.Quotation;
import com.medicalerp.repository.QuotationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quotations")
public class QuotationController {

    @Autowired private QuotationRepository repo;

    @GetMapping
    public List<Quotation> getAll(@RequestParam(required = false) Long customerId,
                                  @RequestParam(required = false) String status) {
        if (customerId != null) return repo.findByCustomerId(customerId);
        if (status != null && !status.isEmpty()) return repo.findByStatus(status);
        return repo.findAll();
    }

    @PostMapping
    public Quotation create(@RequestBody Quotation quotation) {
        if (quotation.getQuotationNumber() == null || quotation.getQuotationNumber().isEmpty()) {
            quotation.setQuotationNumber("QT-" + System.currentTimeMillis());
        }
        return repo.save(quotation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quotation> update(@PathVariable Long id, @RequestBody Quotation quotation) {
        return repo.findById(id).map(e -> { quotation.setId(id); return ResponseEntity.ok(repo.save(quotation)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
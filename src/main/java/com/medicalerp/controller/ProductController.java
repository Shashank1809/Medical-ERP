package com.medicalerp.controller;

import com.medicalerp.model.Product;
import com.medicalerp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired private ProductRepository repo;

    @GetMapping
    public List<Product> getAll(@RequestParam(required = false) String search,
                                @RequestParam(required = false) Long categoryId,
                                @RequestParam(required = false) String status) {
        if (search != null && !search.isEmpty()) return repo.findByNameContainingIgnoreCase(search);
        if (categoryId != null) return repo.findByCategoryId(categoryId);
        if (status != null && !status.isEmpty()) return repo.findByStatus(status);
        return repo.findAll();
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        if (product.getProductCode() == null || product.getProductCode().isEmpty()) {
            product.setProductCode("PROD-" + System.currentTimeMillis());
        }
        return repo.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return repo.findById(id).map(e -> { product.setId(id); return ResponseEntity.ok(repo.save(product)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
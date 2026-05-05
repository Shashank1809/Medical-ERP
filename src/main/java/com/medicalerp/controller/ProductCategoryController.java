package com.medicalerp.controller;

import com.medicalerp.model.ProductCategory;
import com.medicalerp.repository.ProductCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/product-categories")
public class ProductCategoryController {

    @Autowired private ProductCategoryRepository repo;

    @GetMapping
    public List<ProductCategory> getAll() { return repo.findAll(); }

    @PostMapping
    public ProductCategory create(@RequestBody ProductCategory category) { return repo.save(category); }

    @PutMapping("/{id}")
    public ResponseEntity<ProductCategory> update(@PathVariable Long id, @RequestBody ProductCategory category) {
        return repo.findById(id).map(e -> { category.setId(id); return ResponseEntity.ok(repo.save(category)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
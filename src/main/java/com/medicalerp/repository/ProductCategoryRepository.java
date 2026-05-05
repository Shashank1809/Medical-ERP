package com.medicalerp.repository;

import com.medicalerp.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {}


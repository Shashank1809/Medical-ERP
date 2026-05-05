package com.medicalerp.repository;

import com.medicalerp.model.AMCRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AMCRecordRepository extends JpaRepository<AMCRecord, Long> {
    List<AMCRecord> findByCustomerId(Long customerId);
    List<AMCRecord> findByStatus(String status);
}
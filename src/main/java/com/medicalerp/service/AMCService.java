package com.medicalerp.service;

import com.medicalerp.model.AMCRecord;
import com.medicalerp.repository.AMCRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AMCService {
    @Autowired
    private AMCRecordRepository amcRepository;

    public AMCRecord logVisit(Long amcId) {
        AMCRecord record = amcRepository.findById(amcId).orElseThrow();
        if (record.getVisitsCompleted() < record.getTotalVisits()) {
            record.setVisitsCompleted(record.getVisitsCompleted() + 1);
        }
        if (record.getVisitsCompleted().equals(record.getTotalVisits())) {
            record.setStatus("COMPLETED");
        }
        return amcRepository.save(record);
    }
}
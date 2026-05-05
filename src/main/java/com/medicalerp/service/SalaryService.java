package com.medicalerp.service;

import com.medicalerp.model.SalaryWage;
import com.medicalerp.repository.SalaryWageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SalaryService {
    @Autowired
    private SalaryWageRepository salaryRepository;

    public SalaryWage calculateAndSaveSalary(SalaryWage sw) {
        // Net Salary = (Basic + HRA + Allowances) - Deductions
        sw.setNetSalary(
                sw.getBasicSalary()
                        .add(sw.getHra())
                        .add(sw.getAllowances())
                        .subtract(sw.getDeductions())
        );
        return salaryRepository.save(sw);
    }
}
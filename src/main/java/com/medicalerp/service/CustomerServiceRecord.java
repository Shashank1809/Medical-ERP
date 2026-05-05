package com.medicalerp.service;

import com.medicalerp.model.CustomerService;
import com.medicalerp.repository.CustomerServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerServiceRecord {
    @Autowired
    private CustomerServiceRepository serviceRepository;

    public CustomerService updateServiceStatus(Long id, String status) {
        CustomerService service = serviceRepository.findById(id).orElseThrow();
        service.setStatus(status);
        return serviceRepository.save(service);
    }
}
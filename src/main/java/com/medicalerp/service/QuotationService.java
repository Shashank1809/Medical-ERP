package com.medicalerp.service;

import com.medicalerp.model.Quotation;
import com.medicalerp.model.QuotationItem;
import com.medicalerp.repository.QuotationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class QuotationService {
    @Autowired
    private QuotationRepository quotationRepository;

    public Quotation createQuotation(Quotation quotation) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (QuotationItem item : quotation.getItems()) {
            BigDecimal itemTotal = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
            item.setTotal(itemTotal);
            totalAmount = totalAmount.add(itemTotal);
        }

        quotation.setTotalAmount(totalAmount);
        // Assuming 18% GST for medical services if not specified
        BigDecimal gstAmount = totalAmount.multiply(new BigDecimal("0.18"));
        quotation.setGstAmount(gstAmount);
        quotation.setGrandTotal(totalAmount.add(gstAmount).subtract(quotation.getDiscount()));

        return quotationRepository.save(quotation);
    }
}
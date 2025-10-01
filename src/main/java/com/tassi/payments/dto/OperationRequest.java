package com.tassi.payments.dto;

import java.math.BigDecimal;

public class OperationRequest {
    
    private BigDecimal value;

    public OperationRequest() {}

    // getters and setters

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }
}
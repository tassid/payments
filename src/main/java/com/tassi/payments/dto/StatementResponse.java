package com.tassi.payments.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatementResponse {
    private Long accountId;
    private BigDecimal balance;
    private List<TransactionDto> transactions;
}

package com.tassi.payments.service;

import java.math.BigDecimal;
import java.util.List;

import com.tassi.payments.model.Account;
import com.tassi.payments.model.Transaction;

public interface AccountService {
    
    // create account
    Account createAccount(Long personId, BigDecimal initialDeposit, BigDecimal dailyLimit, Integer accountType);

    // deposit
    void deposit(Long accountId, BigDecimal value);

    // withdraw
    void withdraw(Long accountId, BigDecimal value);

    // get balance
    BigDecimal getBalance(Long accountId);

    // block account
    Account blockAccount(Long accountId);

    // unblock account
    Account unblockAccount(Long accountId);

    // get transaction statement
    List<Transaction> getStatement(Long accountId);
    
}
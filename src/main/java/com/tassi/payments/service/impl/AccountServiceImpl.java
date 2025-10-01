package com.tassi.payments.service.impl;

import com.tassi.payments.model.Account;
import com.tassi.payments.model.Person;
import com.tassi.payments.model.Transaction;
import com.tassi.payments.repository.AccountRepository;
import com.tassi.payments.repository.TransactionRepository;
import com.tassi.payments.repository.PersonRepository;
import com.tassi.payments.service.AccountService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final PersonRepository personRepository;

    public AccountServiceImpl(AccountRepository accountRepository, 
                              TransactionRepository transactionRepository,
                              PersonRepository personRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.personRepository = personRepository;
    }

    // new account
    @Override
    @Transactional
    public Account createAccount(Long personId, BigDecimal initialDeposit, BigDecimal dailyLimit, Integer accountType) {
        Person person = personRepository.findById(personId)
            .orElseThrow(() -> new IllegalArgumentException("Error: Person not found with ID: " + personId));

        Account newAccount = new Account();
        newAccount.setPerson(person);
        newAccount.setBalance(initialDeposit == null ? BigDecimal.ZERO : initialDeposit);
        newAccount.setDailyWithdrawalLimit(dailyLimit);
        newAccount.setIsActiveFlag(true); 
        newAccount.setAccountType(accountType);
        newAccount.setCreationDate(LocalDateTime.now());

        return accountRepository.save(newAccount);
    }

    // deposit
    @Override
    @Transactional
    public void deposit(Long accountId, BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit value must be positive.");
        }

        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        
        if (!account.getIsActiveFlag()) {
            throw new IllegalStateException("Account is blocked and cannot receive deposits.");
        }

        // update balance
        account.setBalance(account.getBalance().add(value));
        accountRepository.save(account);

        // record transaction
        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setValue(value); // Positive value for Deposit
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    // withdrawal
    @Override
    @Transactional
    public void withdraw(Long accountId, BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal value must be positive.");
        }

        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        if (!account.getIsActiveFlag()) {
            throw new IllegalStateException("Account is blocked.");
        }

        // insufficient funds
        if (account.getBalance().compareTo(value) < 0) {
            throw new IllegalStateException("Insufficient balance for withdrawal.");
        }
        
        // daily limit
        if (account.getDailyWithdrawalLimit().compareTo(value) < 0) {
            throw new IllegalStateException("Withdrawal amount exceeds daily limit.");
        }

        // update balance
        account.setBalance(account.getBalance().subtract(value));
        accountRepository.save(account);

        // record transaction
        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        // Note: Use negative value for debit/withdrawal
        transaction.setValue(value.negate()); 
        transaction.setTransactionDate(LocalDateTime.now());
        transactionRepository.save(transaction);
    }
    
    // balance inquiry
    @Override
    public BigDecimal getBalance(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        
        return account.getBalance();
    }

    // blocks account
    @Override
    @Transactional
    public Account blockAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        if (!account.getIsActiveFlag()) {
             throw new IllegalStateException("Account is already blocked.");
        }

        account.setIsActiveFlag(false); 
        return accountRepository.save(account);
    }

    // transaction statement
    @Override
    public List<Transaction> getStatement(Long accountId) {
    
        return transactionRepository.findByAccountIdOrderByTransactionDateDesc(accountId);
    }
}
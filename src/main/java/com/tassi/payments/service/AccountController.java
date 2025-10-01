package com.tassi.payments.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tassi.payments.dto.AccountRequest;
import com.tassi.payments.dto.OperationRequest;
import com.tassi.payments.model.Account;
import com.tassi.payments.model.Transaction;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/accounts")
@Tag(name = "Account Management", description = "Operations related to bank accounts: creation, transactions, and status control.")
public class AccountController {

    private final AccountService accountService;

    // Dependency Injection
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // --- 1. Implement path that creates a new account (POST) ---
    @Operation(summary = "Create a new bank account",
               description = "Registers a new account linked to an existing Person.")
    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody AccountRequest request) {
        Account newAccount = accountService.createAccount(
            request.getPersonId(),
            request.getInitialDeposit(),
            request.getDailyWithdrawalLimit(),
            request.getAccountType()
        );
        return new ResponseEntity<>(newAccount, HttpStatus.CREATED);
    }

    // --- 2. Implement path that performs a deposit operation (POST) ---
    @Operation(summary = "Perform a deposit",
               description = "Increments the balance of the specified account and records a transaction. Account must be active.")
    @PostMapping("/{accountId}/deposit")
    public ResponseEntity<Void> deposit(@PathVariable Long accountId, 
                                        @RequestBody OperationRequest request) {
        accountService.deposit(accountId, request.getValue());
        return ResponseEntity.ok().build();
    }

    // --- 3. Implement path that performs a withdrawal operation (POST) ---
    @Operation(summary = "Perform a withdrawal",
               description = "Decrements the account balance. Validates balance and daily withdrawal limit.")
    @PostMapping("/{accountId}/withdraw")
    public ResponseEntity<Void> withdraw(@PathVariable Long accountId, 
                                         @RequestBody OperationRequest request) {
        accountService.withdraw(accountId, request.getValue());
        return ResponseEntity.ok().build(); 
    }
    
    // --- 4. Implement path that performs a balance inquiry (GET) ---
    @Operation(summary = "Get current balance",
               description = "Retrieves the current monetary balance of the specified account.")
    @GetMapping("/{accountId}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable Long accountId) {
        BigDecimal balance = accountService.getBalance(accountId);
        return ResponseEntity.ok(balance);
    }
    
    // --- 5. Implement path that blocks an account (PATCH) ---
    @Operation(summary = "Block an account",
               description = "Sets the 'isActiveFlag' to FALSE, preventing further transactions.")
    @PatchMapping("/{accountId}/block")
    public ResponseEntity<Account> blockAccount(@PathVariable Long accountId) {
        Account blockedAccount = accountService.blockAccount(accountId);
        return ResponseEntity.ok(blockedAccount);
    }

    // --- 6. Implement path that retrieves the transaction statement (GET) ---
    @Operation(summary = "Get transaction statement",
               description = "Retrieves a list of all transactions for the specified account.")
    @GetMapping("/{accountId}/statement")
    public ResponseEntity<List<Transaction>> getStatement(@PathVariable Long accountId) {
        List<Transaction> statement = accountService.getStatement(accountId);
        return ResponseEntity.ok(statement);
    }
}

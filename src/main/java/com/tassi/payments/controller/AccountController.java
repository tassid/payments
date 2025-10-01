package com.tassi.payments.controller; 

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tassi.payments.dto.AccountRequest;
import com.tassi.payments.dto.OperationRequest;
import com.tassi.payments.model.Account;
import com.tassi.payments.model.Transaction;
import com.tassi.payments.service.AccountService;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // POST - new account
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

    // POST - deposit
    @PostMapping("/{accountId}/deposit")
    public ResponseEntity<Void> deposit(@PathVariable Long accountId, 
                                        @RequestBody OperationRequest request) {
        accountService.deposit(accountId, request.getValue());
        return ResponseEntity.ok().build(); // HTTP 200 OK or 204 No Content
    }

    // POST - withdraw
    @PostMapping("/{accountId}/withdraw")
    public ResponseEntity<Void> withdraw(@PathVariable Long accountId, 
                                         @RequestBody OperationRequest request) {
        accountService.withdraw(accountId, request.getValue());
        return ResponseEntity.ok().build(); 
    }
    
    // GET - balance
    @GetMapping("/{accountId}/balance")
    public ResponseEntity<BigDecimal> getBalance(@PathVariable Long accountId) {
        BigDecimal balance = accountService.getBalance(accountId);
        return ResponseEntity.ok(balance);
    }

    // PATCH - block account
    @PatchMapping("/{accountId}/block")
    public ResponseEntity<Account> blockAccount(@PathVariable Long accountId) {
        Account blockedAccount = accountService.blockAccount(accountId);
        return ResponseEntity.ok(blockedAccount);
    }

    // GET - statement
    @GetMapping("/{accountId}/statement")
    public ResponseEntity<List<Transaction>> getStatement(@PathVariable Long accountId) {
        List<Transaction> statement = accountService.getStatement(accountId);
        return ResponseEntity.ok(statement);
    }

    // GET - statement by period
    @GetMapping("/{accountId}/statement-by-period")
    public ResponseEntity<List<Transaction>> getStatementByPeriod(
            @PathVariable Long accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        return new ResponseEntity<>(List.of(), HttpStatus.NOT_IMPLEMENTED); 
    }
}
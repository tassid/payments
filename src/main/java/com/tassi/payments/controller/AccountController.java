package com.tassi.payments.controller; 

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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
import com.tassi.payments.dto.StatementResponse;
import com.tassi.payments.dto.TransactionDto;
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

    // PATCH - unblock account
    @PatchMapping("/{accountId}/unblock")
    public ResponseEntity<Account> unblockAccount(@PathVariable Long accountId) {
        Account unblockedAccount = accountService.unblockAccount(accountId);
        return ResponseEntity.ok(unblockedAccount);
    }

    // GET - statement
    @GetMapping("/{accountId}/statement")
    public ResponseEntity<StatementResponse> getStatement(@PathVariable Long accountId) {
        List<Transaction> transactions = accountService.getStatement(accountId);
        BigDecimal balance = accountService.getBalance(accountId);

        List<TransactionDto> transactionDtos = transactions.stream()
            .map(t -> {
                TransactionDto dto = new TransactionDto();
                dto.setId(t.getIdTransaction());
                dto.setType(t.getValue().compareTo(BigDecimal.ZERO) >= 0 ? "Depósito" : "Saque");
                dto.setAmount(t.getValue().abs());
                dto.setCreatedAt(t.getTransactionDate());
                return dto;
            })
            .collect(Collectors.toList());

        StatementResponse response = new StatementResponse(accountId, balance, transactionDtos);
        return ResponseEntity.ok(response);
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
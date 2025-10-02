package com.tassi.payments.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.tassi.payments.model.Account;
import com.tassi.payments.model.Person;
import com.tassi.payments.repository.AccountRepository;
import com.tassi.payments.repository.PersonRepository;
import com.tassi.payments.repository.TransactionRepository;
import com.tassi.payments.service.impl.AccountServiceImpl;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private PersonRepository personRepository;

    @InjectMocks
    private AccountServiceImpl accountService;

    private Person testPerson;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testPerson = new Person();
        testPerson.setIdPerson(1L);
        testPerson.setName("John Doe");
        testPerson.setCpf("123.456.789-00");
        testPerson.setDateOfBirth(LocalDate.of(1990, 1, 1));

        testAccount = new Account();
        testAccount.setIdAccount(1L);
        testAccount.setPerson(testPerson);
        testAccount.setBalance(new BigDecimal("1000.00"));
        testAccount.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        testAccount.setIsActiveFlag(true);
        testAccount.setAccountType(1);
    }

    @Test
    void testCreateAccount_Success() {
        // Arrange
        when(personRepository.findById(1L)).thenReturn(Optional.of(testPerson));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        Account result = accountService.createAccount(
            1L,
            new BigDecimal("1000.00"),
            new BigDecimal("500.00"),
            1
        );

        // Assert
        assertNotNull(result);
        assertEquals(testPerson, result.getPerson());
        assertEquals(new BigDecimal("1000.00"), result.getBalance());
        verify(personRepository).findById(1L);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void testCreateAccount_PersonNotFound() {
        // Arrange
        when(personRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> accountService.createAccount(999L, BigDecimal.ZERO, BigDecimal.ZERO, 1)
        );

        assertTrue(exception.getMessage().contains("Person not found"));
        verify(personRepository).findById(999L);
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testDeposit_Success() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        accountService.deposit(1L, new BigDecimal("200.00"));

        // Assert
        verify(accountRepository).findById(1L);
        verify(accountRepository).save(any(Account.class));
        verify(transactionRepository).save(any());
    }

    @Test
    void testDeposit_NegativeValue() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> accountService.deposit(1L, new BigDecimal("-100.00"))
        );

        assertTrue(exception.getMessage().contains("positive"));
        verify(accountRepository, never()).findById(any());
    }

    @Test
    void testDeposit_BlockedAccount() {
        // Arrange
        testAccount.setIsActiveFlag(false);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> accountService.deposit(1L, new BigDecimal("100.00"))
        );

        assertTrue(exception.getMessage().contains("blocked"));
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testWithdraw_Success() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        accountService.withdraw(1L, new BigDecimal("200.00"));

        // Assert
        verify(accountRepository).findById(1L);
        verify(accountRepository).save(any(Account.class));
        verify(transactionRepository).save(any());
    }

    @Test
    void testWithdraw_InsufficientBalance() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> accountService.withdraw(1L, new BigDecimal("2000.00"))
        );

        assertTrue(exception.getMessage().contains("Insufficient balance"));
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testWithdraw_ExceedsDailyLimit() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> accountService.withdraw(1L, new BigDecimal("600.00"))
        );

        assertTrue(exception.getMessage().contains("daily limit"));
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testGetBalance_Success() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act
        BigDecimal balance = accountService.getBalance(1L);

        // Assert
        assertEquals(new BigDecimal("1000.00"), balance);
        verify(accountRepository).findById(1L);
    }

    @Test
    void testBlockAccount_Success() {
        // Arrange
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // Act
        Account result = accountService.blockAccount(1L);

        // Assert
        assertNotNull(result);
        verify(accountRepository).findById(1L);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void testBlockAccount_AlreadyBlocked() {
        // Arrange
        testAccount.setIsActiveFlag(false);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        // Act & Assert
        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> accountService.blockAccount(1L)
        );

        assertTrue(exception.getMessage().contains("already blocked"));
        verify(accountRepository, never()).save(any());
    }
}

package com.tassi.payments.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tassi.payments.dto.AccountRequest;
import com.tassi.payments.dto.OperationRequest;
import com.tassi.payments.model.Person;
import com.tassi.payments.repository.PersonRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AccountControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PersonRepository personRepository;

    private Person testPerson;

    @BeforeEach
    void setUp() {
        // Create a test person
        testPerson = new Person();
        testPerson.setName("John Doe");
        testPerson.setCpf("123.456.789-00");
        testPerson.setDateOfBirth(LocalDate.of(1990, 1, 1));
        testPerson = personRepository.save(testPerson);
    }

    @Test
    void testCreateAccount_Success() throws Exception {
        AccountRequest request = new AccountRequest();
        request.setPersonId(testPerson.getIdPerson());
        request.setInitialDeposit(new BigDecimal("1000.00"));
        request.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        request.setAccountType(1);

        mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idAccount").exists())
                .andExpect(jsonPath("$.balance").value(1000.00))
                .andExpect(jsonPath("$.dailyWithdrawalLimit").value(500.00))
                .andExpect(jsonPath("$.isActiveFlag").value(true));
    }

    @Test
    void testCreateAccount_PersonNotFound() throws Exception {
        AccountRequest request = new AccountRequest();
        request.setPersonId(999L);
        request.setInitialDeposit(new BigDecimal("1000.00"));
        request.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        request.setAccountType(1);

        mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(result ->
                    assertTrue(result.getResolvedException() instanceof IllegalArgumentException));
    }

    @Test
    void testDeposit_Success() throws Exception {
        // First create an account
        AccountRequest accountRequest = new AccountRequest();
        accountRequest.setPersonId(testPerson.getIdPerson());
        accountRequest.setInitialDeposit(new BigDecimal("1000.00"));
        accountRequest.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        accountRequest.setAccountType(1);

        String response = mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long accountId = objectMapper.readTree(response).get("idAccount").asLong();

        // Now deposit
        OperationRequest depositRequest = new OperationRequest();
        depositRequest.setValue(new BigDecimal("200.00"));

        mockMvc.perform(post("/api/v1/accounts/" + accountId + "/deposit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(depositRequest)))
                .andExpect(status().isOk());

        // Verify balance
        mockMvc.perform(get("/api/v1/accounts/" + accountId + "/balance"))
                .andExpect(status().isOk())
                .andExpect(content().string("1200.00"));
    }

    @Test
    void testWithdraw_Success() throws Exception {
        // First create an account
        AccountRequest accountRequest = new AccountRequest();
        accountRequest.setPersonId(testPerson.getIdPerson());
        accountRequest.setInitialDeposit(new BigDecimal("1000.00"));
        accountRequest.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        accountRequest.setAccountType(1);

        String response = mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long accountId = objectMapper.readTree(response).get("idAccount").asLong();

        // Now withdraw
        OperationRequest withdrawRequest = new OperationRequest();
        withdrawRequest.setValue(new BigDecimal("300.00"));

        mockMvc.perform(post("/api/v1/accounts/" + accountId + "/withdraw")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(withdrawRequest)))
                .andExpect(status().isOk());

        // Verify balance
        mockMvc.perform(get("/api/v1/accounts/" + accountId + "/balance"))
                .andExpect(status().isOk())
                .andExpect(content().string("700.00"));
    }

    @Test
    void testWithdraw_InsufficientBalance() throws Exception {
        // First create an account
        AccountRequest accountRequest = new AccountRequest();
        accountRequest.setPersonId(testPerson.getIdPerson());
        accountRequest.setInitialDeposit(new BigDecimal("100.00"));
        accountRequest.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        accountRequest.setAccountType(1);

        String response = mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long accountId = objectMapper.readTree(response).get("idAccount").asLong();

        // Try to withdraw more than balance
        OperationRequest withdrawRequest = new OperationRequest();
        withdrawRequest.setValue(new BigDecimal("500.00"));

        mockMvc.perform(post("/api/v1/accounts/" + accountId + "/withdraw")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(withdrawRequest)))
                .andExpect(result ->
                    assertTrue(result.getResolvedException() instanceof IllegalStateException));
    }

    @Test
    void testGetBalance() throws Exception {
        // First create an account
        AccountRequest accountRequest = new AccountRequest();
        accountRequest.setPersonId(testPerson.getIdPerson());
        accountRequest.setInitialDeposit(new BigDecimal("1500.50"));
        accountRequest.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        accountRequest.setAccountType(1);

        String response = mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long accountId = objectMapper.readTree(response).get("idAccount").asLong();

        // Get balance
        mockMvc.perform(get("/api/v1/accounts/" + accountId + "/balance"))
                .andExpect(status().isOk())
                .andExpect(content().string("1500.50"));
    }

    @Test
    void testBlockAccount() throws Exception {
        // First create an account
        AccountRequest accountRequest = new AccountRequest();
        accountRequest.setPersonId(testPerson.getIdPerson());
        accountRequest.setInitialDeposit(new BigDecimal("1000.00"));
        accountRequest.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        accountRequest.setAccountType(1);

        String response = mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long accountId = objectMapper.readTree(response).get("idAccount").asLong();

        // Block the account
        mockMvc.perform(patch("/api/v1/accounts/" + accountId + "/block"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActiveFlag").value(false));
    }

    @Test
    void testGetStatement() throws Exception {
        // First create an account
        AccountRequest accountRequest = new AccountRequest();
        accountRequest.setPersonId(testPerson.getIdPerson());
        accountRequest.setInitialDeposit(new BigDecimal("1000.00"));
        accountRequest.setDailyWithdrawalLimit(new BigDecimal("500.00"));
        accountRequest.setAccountType(1);

        String response = mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long accountId = objectMapper.readTree(response).get("idAccount").asLong();

        // Perform some transactions
        OperationRequest depositRequest = new OperationRequest();
        depositRequest.setValue(new BigDecimal("200.00"));
        mockMvc.perform(post("/api/v1/accounts/" + accountId + "/deposit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(depositRequest)));

        // Get statement
        mockMvc.perform(get("/api/v1/accounts/" + accountId + "/statement"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

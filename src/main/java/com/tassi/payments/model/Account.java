package com.tassi.payments.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ACCOUNTS")
@Data 
@NoArgsConstructor
@AllArgsConstructor 
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "id_account")
    private Long idAccount;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_person", nullable = false)
    private Person person; 

    @Column(name = "balance", nullable = false, precision = 18, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "daily_withdrawal_limit", nullable = false, precision = 18, scale = 2)
    private BigDecimal dailyWithdrawalLimit;

    @Column(name = "is_active_flag", nullable = false)
    private Boolean isActiveFlag;

    @Column(name = "account_type", nullable = false)
    private Integer accountType;

    @Column(name = "creation_date", nullable = false)
    private LocalDateTime creationDate;

}
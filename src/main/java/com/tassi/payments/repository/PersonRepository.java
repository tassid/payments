package com.tassi.payments.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tassi.payments.model.Person;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
}
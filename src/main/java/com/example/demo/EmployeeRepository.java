package com.example.demo;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity,Long>{
    
    public EmployeeEntity findByname(String name);

    public EmployeeEntity findBynameIgnoreCase(String name);
}

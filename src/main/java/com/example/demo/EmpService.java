package com.example.demo;

import java.util.List;

interface EmpService {
    public List<Employee> getEmployee();
    public String createEmployee(Employee employee);
    public boolean delteEmployee(Long id);
    public String updateEmployee(Long id,Employee emp);
}

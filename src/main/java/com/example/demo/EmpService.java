package com.example.demo;

import java.util.List;

interface EmpService {
    public List<Employee> getEmployee();
    public Employee getEmployeeById(Long id);
    public String createEmployee(Employee employee);
    public boolean delteEmployee(Long id);
    public String updateEmployee(Long id,Employee emp);
    public Employee getEmployeeByName(String name);
}

package com.example.demo;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class EmpServiceImpl implements EmpService {

    List<Employee> emp=new ArrayList<>();

    @Override
    public List<Employee> getEmployee() {
       return emp;
    }

    @Override
    public String createEmployee(Employee employee) {
        if(emp.add(employee)){
            return "Saved Successfully";
        }
        return "Try Again";
    }

    @Override
    public boolean delteEmployee(Long id) {
        return emp.remove(id.intValue()) != null;
    }

    @Override
    public String updateEmployee(int id, Employee emp) {
         return "Updated";
    }
    
}

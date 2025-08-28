package com.example.demo;

import org.springframework.web.bind.annotation.RestController;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;




@RestController
public class EmpController {

    @Autowired
    EmpService empService;

    // EmpService empService=new EmpServiceImpl();

    @GetMapping("/Employees")
    public List<Employee> getAllEmployees() {
        return empService.getEmployee();
    }

    @PostMapping("/Employees")
    public String createEmployee(@RequestBody Employee employe) {
        String result=empService.createEmployee(employe);
        return result;
    }

    @DeleteMapping("/Employees/{id}")
    public String deleteEmployeeById(@PathVariable Long id){
        if(empService.delteEmployee(id)){
            return "Delete Successfully";
        }
        return"Not Found";
    }

    @PutMapping("path/{id}")
    public String putMethodName(@PathVariable Long id, @RequestBody Employee employee) {
        
        return empService.updateEmployee(id, employee);
    }
    
    
}

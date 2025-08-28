package com.example.demo;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmpServiceImpl implements EmpService {

    // List<Employee> emp=new ArrayList<>();

    @Autowired
    private EmployeeRepository employeeRepo;

    @Override
    public List<Employee> getEmployee() {
        List<EmployeeEntity> employeesList=employeeRepo.findAll();
        List<Employee> employee=new ArrayList<>();
        for(EmployeeEntity e:employeesList){
            Employee emp=new Employee();
            emp.setId(e.getId());
            emp.setName(e.getName());
            emp.setEmail(e.getEmail());
            emp.setNumber(e.getNumber());

            employee.add(emp);
        }

       return employee;
    }

    @Override
    public String createEmployee(Employee employee) {
        EmployeeEntity employeeEntity=new EmployeeEntity();
        BeanUtils.copyProperties(employee, employeeEntity);
        employeeRepo.save(employeeEntity);
        return "Saved Succesfully";
    }

    @Override
    public boolean delteEmployee(Long id) {
        EmployeeEntity emp=employeeRepo.findById(id).get();
        employeeRepo.delete(emp);
        return true;
    }

    @Override
    public String updateEmployee(Long id, Employee emp) {
         return "Updated";
    }
    
}

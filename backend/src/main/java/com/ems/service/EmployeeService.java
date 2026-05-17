package com.ems.service;

import com.ems.dto.DashboardStats;
import com.ems.dto.EmployeeRequest;
import com.ems.dto.EmployeeResponse;
import com.ems.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.servlet.http.HttpServletResponse;

public interface EmployeeService {
    Page<EmployeeResponse> searchEmployees(String search, Long deptId,
                                            Employee.EmployeeStatus status, Pageable pageable);
    EmployeeResponse getById(Long id);
    EmployeeResponse create(EmployeeRequest request);
    EmployeeResponse update(Long id, EmployeeRequest request);
    void delete(Long id);
    DashboardStats getDashboardStats();
    void exportToCsv(String search, HttpServletResponse response);
    void exportToPdf(String search, HttpServletResponse response);
}

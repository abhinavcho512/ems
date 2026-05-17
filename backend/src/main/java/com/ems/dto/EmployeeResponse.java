package com.ems.dto;

import com.ems.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private BigDecimal salary;
    private Employee.EmployeeStatus status;
    private LocalDate joinDate;
    private Long departmentId;
    private String departmentName;
}

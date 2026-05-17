package com.ems.dto;

import com.ems.model.Employee;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Invalid email") @NotBlank
    private String email;

    private String phone;

    @NotNull(message = "Salary required") @DecimalMin("0.0")
    private BigDecimal salary;

    private Employee.EmployeeStatus status;
    private LocalDate joinDate;
    private Long departmentId;
}

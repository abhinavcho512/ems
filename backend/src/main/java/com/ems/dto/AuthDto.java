package com.ems.dto;

import com.ems.model.Employee;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

// ===== Auth DTOs =====
public class AuthDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String role;
    }
}

// ===== Employee DTOs =====
class EmployeeDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @Email @NotBlank
        private String email;

        private String phone;

        @NotNull @DecimalMin("0.0")
        private BigDecimal salary;

        private Employee.EmployeeStatus status;
        private LocalDate joinDate;
        private Long departmentId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
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
}

// ===== Department DTOs =====
class DepartmentDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank private String name;
        private String description;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private long employeeCount;
    }
}

// ===== Dashboard =====
class DashboardDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Stats {
        private long totalEmployees;
        private long activeEmployees;
        private long newThisMonth;
        private long totalDepartments;
        private java.util.List<DeptStat> departmentStats;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DeptStat {
        private String name;
        private long count;
    }
}

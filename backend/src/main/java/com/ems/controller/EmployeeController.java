package com.ems.controller;

import com.ems.dto.DashboardStats;
import com.ems.dto.EmployeeRequest;
import com.ems.dto.EmployeeResponse;
import com.ems.model.Employee;
import com.ems.service.EmployeeService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    // ✅ BOTH USER and ADMIN can view
    @GetMapping
    public ResponseEntity<Page<EmployeeResponse>> getAll(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Employee.EmployeeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(
                employeeService.searchEmployees(search, deptId, status, pageable)
        );
    }

    // ✅ BOTH USER and ADMIN can view single employee
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getById(id));
    }

    // ✅ BOTH USER and ADMIN can view dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(employeeService.getDashboardStats());
    }

    // ✅ BOTH USER and ADMIN can export
    @GetMapping("/export/csv")
    public void exportCsv(
            @RequestParam(defaultValue = "") String search,
            HttpServletResponse response) {
        employeeService.exportToCsv(search, response);
    }

    @GetMapping("/export/pdf")
    public void exportPdf(
            @RequestParam(defaultValue = "") String search,
            HttpServletResponse response) {
        employeeService.exportToPdf(search, response);
    }

    // 🔒 ADMIN only — create
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> create(
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeService.create(request));
    }

    // 🔒 ADMIN only — update
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.update(id, request));
    }

    // 🔒 ADMIN only — delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
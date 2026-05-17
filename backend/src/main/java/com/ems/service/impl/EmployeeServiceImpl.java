package com.ems.service.impl;

import com.ems.dto.DashboardStats;
import com.ems.dto.EmployeeRequest;
import com.ems.dto.EmployeeResponse;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.Department;
import com.ems.model.Employee;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.EmployeeService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.opencsv.CSVWriter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> searchEmployees(String search, Long deptId,
                                                   Employee.EmployeeStatus status,
                                                   Pageable pageable) {
        return employeeRepository
                .searchEmployees(search, deptId, status, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    public EmployeeResponse create(EmployeeRequest req) {
        if (employeeRepository.findById(-1L).isEmpty()) { /* warm up */ }
        // Check duplicate email
        employeeRepository.findAll().stream()
                .filter(e -> e.getEmail().equalsIgnoreCase(req.getEmail()))
                .findFirst()
                .ifPresent(e -> { throw new DuplicateResourceException("Email already in use: " + req.getEmail()); });

        Employee employee = Employee.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .salary(req.getSalary())
                .status(req.getStatus() != null ? req.getStatus() : Employee.EmployeeStatus.ACTIVE)
                .joinDate(req.getJoinDate() != null ? req.getJoinDate() : LocalDate.now())
                .department(resolveDepartment(req.getDepartmentId()))
                .build();

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public EmployeeResponse update(Long id, EmployeeRequest req) {
        Employee employee = findOrThrow(id);

        employee.setFirstName(req.getFirstName());
        employee.setLastName(req.getLastName());
        employee.setEmail(req.getEmail());
        employee.setPhone(req.getPhone());
        employee.setSalary(req.getSalary());
        if (req.getStatus() != null) employee.setStatus(req.getStatus());
        if (req.getJoinDate() != null) employee.setJoinDate(req.getJoinDate());
        employee.setDepartment(resolveDepartment(req.getDepartmentId()));

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public void delete(Long id) {
        findOrThrow(id);
        employeeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        List<DashboardStats.DeptStat> deptStats = departmentRepository.findAll().stream()
                .map(d -> DashboardStats.DeptStat.builder()
                        .name(d.getName())
                        .count(employeeRepository.countByDepartmentId(d.getId()))
                        .build())
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalEmployees(employeeRepository.count())
                .activeEmployees(employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE))
                .newThisMonth(employeeRepository.countNewThisMonth())
                .totalDepartments(departmentRepository.count())
                .departmentStats(deptStats)
                .build();
    }

    @Override
    public void exportToCsv(String search, HttpServletResponse response) {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=employees.csv");

        List<Employee> employees = employeeRepository.findAllForExport(search);

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(response.getOutputStream()))) {
            writer.writeNext(new String[]{"ID", "First Name", "Last Name", "Email", "Phone",
                    "Department", "Salary", "Status", "Join Date"});
            for (Employee e : employees) {
                writer.writeNext(new String[]{
                        String.valueOf(e.getId()),
                        e.getFirstName(),
                        e.getLastName(),
                        e.getEmail(),
                        e.getPhone() != null ? e.getPhone() : "",
                        e.getDepartment() != null ? e.getDepartment().getName() : "",
                        e.getSalary().toPlainString(),
                        e.getStatus().name(),
                        e.getJoinDate() != null ? e.getJoinDate().toString() : ""
                });
            }
        } catch (IOException ex) {
            throw new RuntimeException("Error exporting CSV", ex);
        }
    }

    @Override
    public void exportToPdf(String search, HttpServletResponse response) {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=employees.pdf");

        List<Employee> employees = employeeRepository.findAllForExport(search);

        try {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph("Employee Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Table
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 2f, 2f, 3f, 2f, 2f, 2f});

            String[] headers = {"ID", "First Name", "Last Name", "Email", "Department", "Salary", "Status"};
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8);
            boolean alternate = false;
            for (Employee e : employees) {
                BaseColor bg = alternate ? new BaseColor(240, 240, 240) : BaseColor.WHITE;
                String[] row = {
                        String.valueOf(e.getId()),
                        e.getFirstName(),
                        e.getLastName(),
                        e.getEmail(),
                        e.getDepartment() != null ? e.getDepartment().getName() : "-",
                        "$" + e.getSalary().toPlainString(),
                        e.getStatus().name()
                };
                for (String cell : row) {
                    PdfPCell c = new PdfPCell(new Phrase(cell, dataFont));
                    c.setBackgroundColor(bg);
                    c.setPadding(4);
                    table.addCell(c);
                }
                alternate = !alternate;
            }

            document.add(table);
            document.close();
        } catch (Exception ex) {
            throw new RuntimeException("Error exporting PDF", ex);
        }
    }

    // ===== helpers =====
    private Employee findOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
    }

    private Department resolveDepartment(Long deptId) {
        if (deptId == null) return null;
        return departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", deptId));
    }

    private EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .email(e.getEmail())
                .phone(e.getPhone())
                .salary(e.getSalary())
                .status(e.getStatus())
                .joinDate(e.getJoinDate())
                .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .build();
    }
}

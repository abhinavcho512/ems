package com.ems.service.impl;

import com.ems.dto.DepartmentRequest;
import com.ems.dto.DepartmentResponse;
import com.ems.exception.DuplicateResourceException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.Department;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override @Transactional(readOnly = true)
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public DepartmentResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    public DepartmentResponse create(DepartmentRequest req) {
        if (departmentRepository.existsByName(req.getName())) {
            throw new DuplicateResourceException("Department already exists: " + req.getName());
        }
        Department dept = Department.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();
        return toResponse(departmentRepository.save(dept));
    }

    @Override
    public DepartmentResponse update(Long id, DepartmentRequest req) {
        Department dept = findOrThrow(id);
        dept.setName(req.getName());
        dept.setDescription(req.getDescription());
        return toResponse(departmentRepository.save(dept));
    }

    @Override
    public void delete(Long id) {
        findOrThrow(id);
        if (employeeRepository.countByDepartmentId(id) > 0) {
            throw new IllegalStateException("Cannot delete department with existing employees");
        }
        departmentRepository.deleteById(id);
    }

    private Department findOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
    }

    private DepartmentResponse toResponse(Department d) {
        return DepartmentResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .description(d.getDescription())
                .employeeCount(employeeRepository.countByDepartmentId(d.getId()))
                .build();
    }
}

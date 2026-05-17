package com.ems.service;

import com.ems.dto.DepartmentRequest;
import com.ems.dto.DepartmentResponse;
import java.util.List;

public interface DepartmentService {
    List<DepartmentResponse> getAll();
    DepartmentResponse getById(Long id);
    DepartmentResponse create(DepartmentRequest request);
    DepartmentResponse update(Long id, DepartmentRequest request);
    void delete(Long id);
}

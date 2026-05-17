package com.ems.repository;

import com.ems.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Full-text search across name, email, department
    @Query("""
        SELECT e FROM Employee e
        LEFT JOIN e.department d
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(e.email)     LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(d.name)      LIKE LOWER(CONCAT('%',:search,'%')))
        AND   (:deptId IS NULL OR d.id = :deptId)
        AND   (:status IS NULL OR :status = '' OR e.status = :status)
    """)
    Page<Employee> searchEmployees(
            @Param("search") String search,
            @Param("deptId") Long deptId,
            @Param("status") Employee.EmployeeStatus status,
            Pageable pageable
    );

    // For export — all matching without pagination
    @Query("""
        SELECT e FROM Employee e
        LEFT JOIN e.department d
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(e.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(e.email)     LIKE LOWER(CONCAT('%',:search,'%')))
    """)
    List<Employee> findAllForExport(@Param("search") String search);

    // Dashboard stats
    long countByStatus(Employee.EmployeeStatus status);
    long countByDepartmentId(Long departmentId);

    @Query("SELECT COUNT(e) FROM Employee e WHERE MONTH(e.joinDate) = MONTH(CURRENT_DATE) AND YEAR(e.joinDate) = YEAR(CURRENT_DATE)")
    long countNewThisMonth();
}

package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStats {
    private long totalEmployees;
    private long activeEmployees;
    private long newThisMonth;
    private long totalDepartments;
    private List<DeptStat> departmentStats;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DeptStat {
        private String name;
        private long count;
    }
}

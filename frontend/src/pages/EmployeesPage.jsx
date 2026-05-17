import { useEffect, useState, useCallback, useRef } from 'react';
import { employeeApi, departmentApi } from '../api';
import toast from 'react-hot-toast';
import {
  Search, Plus, Download, FileText, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Pencil, Trash2, X
} from 'lucide-react';
import EmployeeModal from '../components/EmployeeModal';

const STATUS_COLORS = {
  ACTIVE:   { bg: '#dcfce7', text: '#15803d' },
  INACTIVE: { bg: '#fee2e2', text: '#dc2626' },
  ON_LEAVE: { bg: '#fef9c3', text: '#b45309' },
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ totalPages: 0, totalElements: 0, number: 0 });

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('firstName');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const searchTimer = useRef(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getAll({
        search, deptId: deptFilter || undefined,
        status: statusFilter || undefined,
        page, size: PAGE_SIZE,
        sortBy, sortDir,
      });
      setEmployees(res.data.content);
      setMeta({
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements,
        number: res.data.number,
      });
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, statusFilter, page, sortBy, sortDir]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    departmentApi.getAll().then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  const handleSearch = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(0); }, 350);
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await employeeApi.delete(id);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch {
      toast.error('Could not delete employee');
    }
  };

  const handleExport = async (type) => {
    try {
      const res = type === 'csv'
        ? await employeeApi.exportCsv(search)
        : await employeeApi.exportPdf(search);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees.${type}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${type.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} style={{ opacity: 0.3 }}/>;
    return sortDir === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Employees</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>{meta.totalElements} total records</p>
        </div>
        <button onClick={() => { setEditEmployee(null); setModalOpen(true); }} style={btnStyle('#6366f1')}>
          <Plus size={16}/> Add employee
        </button>
      </div>

      {/* Filters bar */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
        padding: '14px 16px', marginBottom: 16,
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180,
          border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', background: '#f8fafc' }}>
          <Search size={15} color="#94a3b8"/>
          <input
            placeholder="Search by name, email, department…"
            onChange={e => handleSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 13 }}
          />
        </div>

        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(0); }}
          style={selectStyle}>
          <option value="">All departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          style={selectStyle}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On leave</option>
        </select>

        {(search || deptFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter(''); setPage(0); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '7px 10px', background: '#fff', fontSize: 12, color: '#64748b' }}>
            <X size={13}/> Clear
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => handleExport('csv')} style={btnStyle('#fff', '#64748b', '#e2e8f0')}>
            <Download size={14}/> CSV
          </button>
          <button onClick={() => handleExport('pdf')} style={btnStyle('#fff', '#64748b', '#e2e8f0')}>
            <FileText size={14}/> PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {[
                  ['Name', 'firstName'], ['Email', 'email'], ['Department', 'department.name'],
                  ['Salary', 'salary'], ['Status', null], ['Join date', 'joinDate'], ['Actions', null]
                ].map(([label, col]) => (
                  <th key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      padding: '11px 16px', textAlign: 'left', fontSize: 12,
                      fontWeight: 600, color: '#374151', whiteSpace: 'nowrap',
                      cursor: col ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {label} {col && <SortIcon col={col}/>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  No employees found
                </td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#e0e7ff', color: '#4f46e5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, flexShrink: 0,
                      }}>
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>{emp.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{emp.departmentName || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    ${Number(emp.salary).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: STATUS_COLORS[emp.status]?.bg,
                      color: STATUS_COLORS[emp.status]?.text,
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                    {emp.joinDate || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditEmployee(emp); setModalOpen(true); }}
                        style={iconBtn('#e0e7ff', '#4f46e5')}>
                        <Pencil size={13}/>
                      </button>
                      <button onClick={() => handleDelete(emp.id)}
                        style={iconBtn('#fee2e2', '#dc2626')}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: '1px solid #f1f5f9',
          }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Page {meta.number + 1} of {meta.totalPages}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                style={iconBtn('#f8fafc', '#374151', page === 0)}>
                <ChevronLeft size={14}/>
              </button>
              {[...Array(meta.totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)} style={{
                  width: 30, height: 30, borderRadius: 6, border: '1px solid #e2e8f0',
                  background: i === page ? '#6366f1' : '#fff',
                  color: i === page ? '#fff' : '#374151',
                  fontSize: 12, fontWeight: i === page ? 600 : 400,
                }}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= meta.totalPages - 1} onClick={() => setPage(p => p + 1)}
                style={iconBtn('#f8fafc', '#374151', page >= meta.totalPages - 1)}>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <EmployeeModal
          employee={editEmployee}
          departments={departments}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchEmployees(); }}
        />
      )}
    </div>
  );
}

const btnStyle = (bg, color = '#fff', border = 'transparent') => ({
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '9px 14px', borderRadius: 8, border: `1px solid ${border}`,
  background: bg, color, fontWeight: 500, fontSize: 13,
  transition: 'opacity .15s',
});

const selectStyle = {
  padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#f8fafc', fontSize: 13, color: '#374151', outline: 'none',
};

const iconBtn = (bg, color, disabled = false) => ({
  width: 30, height: 30, borderRadius: 6, border: 'none',
  background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
});

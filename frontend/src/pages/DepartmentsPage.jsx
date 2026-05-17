import { useEffect, useState } from 'react';
import { departmentApi } from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Building2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, dept: null });
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    departmentApi.getAll()
      .then(r => setDepartments(r.data))
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ name: '', description: '' }); setModal({ open: true, dept: null }); };
  const openEdit = (dept) => { setForm({ name: dept.name, description: dept.description || '' }); setModal({ open: true, dept }); };
  const closeModal = () => setModal({ open: false, dept: null });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (modal.dept) {
        await departmentApi.update(modal.dept.id, form);
        toast.success('Department updated');
      } else {
        await departmentApi.create(form);
        toast.success('Department created');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await departmentApi.delete(id);
      toast.success('Department deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — may have employees');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Departments</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>{departments.length} departments</p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 14px', borderRadius: 8, border: 'none',
          background: '#6366f1', color: '#fff', fontWeight: 500, fontSize: 13,
        }}>
          <Plus size={16}/> Add department
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 60 }}>Loading…</div>
      ) : departments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
          <Building2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }}/>
          <p>No departments yet. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {departments.map(dept => (
            <div key={dept.id} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20,
              transition: 'box-shadow .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#e0e7ff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <Building2 size={18} color="#4f46e5"/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{dept.name}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dept.description || 'No description'}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 12, borderTop: '1px solid #f1f5f9',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#4f46e5',
                  background: '#e0e7ff', padding: '3px 10px', borderRadius: 20,
                }}>
                  {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(dept)} style={{
                    width: 30, height: 30, borderRadius: 6, border: 'none',
                    background: '#e0e7ff', color: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Pencil size={13}/>
                  </button>
                  <button onClick={() => handleDelete(dept.id)} style={{
                    width: 30, height: 30, borderRadius: 6, border: 'none',
                    background: '#fee2e2', color: '#dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{
            background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,.15)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>
                {modal.dept ? 'Edit department' : 'New department'}
              </h2>
              <button onClick={closeModal} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 8,
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#374151' }}>
                  Department name *
                </label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Engineering"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                    border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}/>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#374151' }}>
                  Description
                </label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="What does this department do?"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                    border: '1px solid #e2e8f0', background: '#f8fafc', resize: 'vertical', outline: 'none' }}/>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={{
                  padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#374151', fontWeight: 500, fontSize: 13,
                }}>Cancel</button>
                <button type="submit" disabled={saving} style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 13,
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? 'Saving…' : modal.dept ? 'Save changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { employeeApi } from '../api';
import { X } from 'lucide-react';

const schema = z.object({
  firstName:    z.string().min(1, 'Required'),
  lastName:     z.string().min(1, 'Required'),
  email:        z.string().email('Invalid email'),
  phone:        z.string().optional(),
  salary:       z.coerce.number().positive('Must be positive'),
  status:       z.enum(['ACTIVE','INACTIVE','ON_LEAVE']).optional(),
  joinDate:     z.string().optional(),
  departmentId: z.coerce.number().optional(),
});

export default function EmployeeModal({ employee, departments, onClose, onSaved }) {
  const isEdit = !!employee;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: employee ? {
      ...employee,
      departmentId: employee.departmentId ?? '',
    } : { status: 'ACTIVE' },
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await employeeApi.update(employee.id, data);
        toast.success('Employee updated');
      } else {
        await employeeApi.create(data);
        toast.success('Employee added');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            {isEdit ? 'Edit employee' : 'Add new employee'}
          </h2>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: 8,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="First name" error={errors.firstName?.message}>
              <input {...register('firstName')} style={inputStyle(errors.firstName)}/>
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <input {...register('lastName')} style={inputStyle(errors.lastName)}/>
            </Field>
          </div>

          <Field label="Email" error={errors.email?.message}>
            <input {...register('email')} type="email" style={inputStyle(errors.email)}/>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Phone" error={errors.phone?.message}>
              <input {...register('phone')} style={inputStyle()}/>
            </Field>
            <Field label="Salary (USD)" error={errors.salary?.message}>
              <input {...register('salary')} type="number" step="0.01" style={inputStyle(errors.salary)}/>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Department">
              <select {...register('departmentId')} style={inputStyle()}>
                <option value="">— None —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select {...register('status')} style={inputStyle()}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On leave</option>
              </select>
            </Field>
          </div>

          <Field label="Join date">
            <input {...register('joinDate')} type="date" style={inputStyle()}/>
          </Field>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', color: '#374151', fontWeight: 500, fontSize: 13,
            }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 13,
              opacity: isSubmitting ? 0.7 : 1,
            }}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3 }}>{error}</p>}
    </div>
  );
}

const inputStyle = (error) => ({
  width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
  border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
  background: '#f8fafc', outline: 'none',
});

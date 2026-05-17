import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  name:     z.string().min(2, 'Name too short'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.register(data);
      const { token, name, email, role } = res.data;
      login({ name, email, role }, token);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8fafc',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, padding: 40,
        background: '#fff', borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,.08)',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#6366f1', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>E</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Create account</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 13 }}>Join EMS Pro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {[
            { name: 'name',     label: 'Full name',  type: 'text',     placeholder: 'John Doe' },
            { name: 'email',    label: 'Email',      type: 'email',    placeholder: 'you@company.com' },
            { name: 'password', label: 'Password',   type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>
                {label}
              </label>
              <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: `1px solid ${errors[name] ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc', outline: 'none',
                }}
              />
              {errors[name] && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors[name].message}</p>
              )}
            </div>
          ))}

          <button type="submit" disabled={isSubmitting} style={{
            width: '100%', padding: '11px', borderRadius: 8, marginTop: 8,
            background: '#6366f1', color: '#fff', border: 'none',
            fontWeight: 600, fontSize: 14, opacity: isSubmitting ? 0.7 : 1,
          }}>
            {isSubmitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

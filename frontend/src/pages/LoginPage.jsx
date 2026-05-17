import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);
      const { token, name, email, role } = res.data;
      login({ name, email, role }, token);
      toast.success(`Welcome back, ${name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#6366f1', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>E</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Welcome back</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 13 }}>Sign in to EMS Pro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Email" error={errors.email?.message}>
            <InputWithIcon icon={<Mail size={16}/>}>
              <input {...register('email')} type="email" placeholder="you@company.com"/>
            </InputWithIcon>
          </Field>

          <Field label="Password" error={errors.password?.message} style={{ marginBottom: 24 }}>
            <InputWithIcon icon={<Lock size={16}/>} right={
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', display: 'flex' }}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            }>
              <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••"/>
            </InputWithIcon>
          </Field>

          <button type="submit" disabled={isSubmitting} style={{
            width: '100%', padding: '11px', borderRadius: 8,
            background: '#6366f1', color: '#fff', border: 'none',
            fontWeight: 600, fontSize: 14,
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'opacity .15s',
          }}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#6366f1', fontWeight: 500 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function InputWithIcon({ icon, right, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid #e2e8f0', borderRadius: 8,
      background: '#f8fafc', padding: '0 12px',
    }}>
      <span style={{ color: '#94a3b8', display: 'flex', marginRight: 8 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        {/* Clone child input with full-width styles */}
        {children}
      </div>
      {right}
    </div>
  );
}

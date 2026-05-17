import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/employees',   icon: Users,           label: 'Employees' },
  { to: '/departments', icon: Building2,        label: 'Departments' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .2s',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #334155',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>E</span>
          </div>
          {!collapsed && (
            <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>
              EMS Pro
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              marginLeft: 'auto', background: 'transparent', border: 'none',
              color: '#94a3b8', display: 'flex', padding: 4,
            }}
          >
            {collapsed ? <Menu size={18}/> : <X size={18}/>}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 4,
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? '#6366f1' : 'transparent',
              transition: 'all .15s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}>
              <Icon size={18} style={{ flexShrink: 0 }}/>
              {!collapsed && <span style={{ fontSize: 13 }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #334155' }}>
          {!collapsed && (
            <div style={{ padding: '8px 12px', marginBottom: 4 }}>
              <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>{user?.name}</p>
              <p style={{ color: '#64748b', fontSize: 11 }}>{user?.role}</p>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#94a3b8',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }}/>
            {!collapsed && <span style={{ fontSize: 13 }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}

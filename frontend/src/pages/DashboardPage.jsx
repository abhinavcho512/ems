import { useEffect, useState } from 'react';
import { employeeApi } from '../api';
import { Users, UserCheck, Building2, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#14b8a6','#8b5cf6'];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      border: '1px solid #e2e8f0', display: 'flex', gap: 16, alignItems: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: color + '20', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={color}/>
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeApi.dashboard()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 28, fontSize: 13 }}>
        Overview of your organisation
      </p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users}     label="Total employees"  value={stats.totalEmployees}  color="#6366f1"/>
        <StatCard icon={UserCheck} label="Active"           value={stats.activeEmployees} color="#22c55e"
                  sub={`${Math.round((stats.activeEmployees/Math.max(stats.totalEmployees,1))*100)}% of total`}/>
        <StatCard icon={UserPlus}  label="New this month"   value={stats.newThisMonth}    color="#f59e0b"/>
        <StatCard icon={Building2} label="Departments"      value={stats.totalDepartments} color="#14b8a6"/>
      </div>

      {/* Chart */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24,
        border: '1px solid #e2e8f0',
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Employees by department</h2>
        {stats.departmentStats?.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.departmentStats} barCategoryGap="35%">
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="count" name="Employees" radius={[6, 6, 0, 0]}>
                {stats.departmentStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>
            No department data yet. Add departments and employees to see the chart.
          </p>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div>
      <div style={{ height: 28, width: 140, background: '#e2e8f0', borderRadius: 6, marginBottom: 28 }}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 88, background: '#e2e8f0', borderRadius: 12, animation: 'pulse 1.5s infinite' }}/>
        ))}
      </div>
    </div>
  );
}

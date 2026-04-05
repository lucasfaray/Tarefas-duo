import { useMemo } from 'react';
import { BarChart2, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr } from '../utils/gamification';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function Stats() {
  const { state } = useApp();

  // Last 30 days activity
  const last30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = daysAgoStr(29 - i);
      const dayLogs = state.habitLogs.filter(l => l.date === date);

      const pointsPerUser: Record<string, number> = {};
      state.users.forEach(u => {
        pointsPerUser[u.name] = dayLogs
          .filter(l => l.userId === u.id)
          .reduce((acc, l) => {
            const h = state.habits.find(h => h.id === l.habitId);
            return acc + (h ? h.points * l.completedCount : 0);
          }, 0);
      });

      state.tasks
        .filter(t => t.completed && t.completedAt?.split('T')[0] === date)
        .forEach(t => {
          const u = state.users.find(u => u.id === t.completedBy);
          if (u) pointsPerUser[u.name] = (pointsPerUser[u.name] ?? 0) + t.points;
        });

      return { date: formatDate(date), ...pointsPerUser };
    });
  }, [state]);

  // Weekly breakdown (last 8 weeks)
  const weekly = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (7 * (7 - i)) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const wsStr = weekStart.toISOString().split('T')[0];
      const weStr = weekEnd.toISOString().split('T')[0];

      const pts: Record<string, number> = {};
      state.users.forEach(u => {
        pts[u.name] = state.habitLogs
          .filter(l => l.userId === u.id && l.date >= wsStr && l.date <= weStr)
          .reduce((acc, l) => {
            const h = state.habits.find(h => h.id === l.habitId);
            return acc + (h ? h.points : 0);
          }, 0);
      });

      return { week: `S${i + 1}`, ...pts };
    });
  }, [state]);

  // Per-habit stats
  const habitStats = useMemo(() => {
    return state.habits.filter(h => h.active).map(h => {
      const logs = state.habitLogs.filter(l => l.habitId === h.id);
      const last30logs = logs.filter(l => l.date >= daysAgoStr(30));
      const completionRate = h.frequency === 'daily' ? Math.round((last30logs.length / 30) * 100) : 0;

      const byUser: Record<string, number> = {};
      state.users.forEach(u => {
        byUser[u.name] = logs.filter(l => l.userId === u.id).length;
      });

      return { habit: h, totalLogs: logs.length, completionRate, byUser, last30: last30logs.length };
    }).sort((a, b) => b.totalLogs - a.totalLogs);
  }, [state]);

  const COLORS = ['#6366f1', '#f72fb2'];
  const today = todayStr();

  // Today completion
  const todayCompletion = state.users.map(user => {
    const myHabits = state.habits.filter(h => h.active && h.frequency === 'daily' && h.assignedTo.includes(user.id));
    const done = myHabits.filter(h =>
      state.habitLogs.some(l => l.habitId === h.id && l.userId === user.id && l.date === today),
    ).length;
    return { name: user.name, done, total: myHabits.length, pct: myHabits.length ? Math.round((done / myHabits.length) * 100) : 0 };
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Estatísticas</h1>
        <p className="text-gray-500 text-sm mt-1">Acompanhe seu progresso e evolução</p>
      </div>

      {/* Today summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        {todayCompletion.map((u, i) => (
          <div key={u.name} className="card">
            <p className="text-sm text-gray-400 mb-2">Hoje — {u.name}</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black" style={{ color: COLORS[i] }}>{u.pct}%</span>
              <div className="flex-1">
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${u.pct}%`, background: COLORS[i] }} />
                </div>
                <p className="text-xs text-gray-600 mt-1">{u.done}/{u.total} hábitos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Points over 30 days */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary-400" />
          <h2 className="font-bold text-gray-100">Pontos — Últimos 30 dias</h2>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                {state.users.map((u, i) => (
                  <linearGradient key={u.id} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#d1d5db' }}
              />
              {state.users.map((u, i) => (
                <Area
                  key={u.id}
                  type="monotone"
                  dataKey={u.name}
                  stroke={COLORS[i]}
                  fill={`url(#grad${i})`}
                  strokeWidth={2}
                />
              ))}
              <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-secondary-400" />
          <h2 className="font-bold text-gray-100">Pontos por Semana</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#d1d5db' }}
              />
              {state.users.map((u, i) => (
                <Bar key={u.id} dataKey={u.name} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
              <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-habit breakdown */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={18} className="text-accent-400" />
          <h2 className="font-bold text-gray-100">Desempenho por Hábito</h2>
        </div>
        <div className="space-y-3">
          {habitStats.map(({ habit, completionRate, byUser, last30: l30 }) => (
            <div key={habit.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
              <span className="text-xl flex-shrink-0">{habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-300 truncate">{habit.title}</p>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{l30}/30 dias</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  {state.users.map(u => (
                    <span key={u.id} className="text-[10px] text-gray-600">
                      {u.avatar} {byUser[u.name] ?? 0}x
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 flex-shrink-0">{completionRate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

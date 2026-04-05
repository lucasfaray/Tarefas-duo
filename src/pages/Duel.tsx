import { useMemo } from 'react';
import { Star, TrendingUp, Swords, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pointsInRange, startOfWeek, startOfMonth, todayStr, getLevelTitle, getXPProgress } from '../utils/gamification';
import ProgressRing from '../components/ProgressRing';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

const CATEGORY_LABELS: Record<string, string> = {
  health: 'Saúde', fitness: 'Fitness', beauty: 'Beleza', nutrition: 'Nutrição',
  productivity: 'Produtiv.', mindfulness: 'Mindful.', social: 'Social',
  finance: 'Finanças', learning: 'Aprend.', other: 'Outro',
};

export default function Duel() {
  const { state } = useApp();
  const now = new Date();
  const weekStart = startOfWeek(now, state.settings.weekStartsOn);
  const monthStart = startOfMonth(now);
  const today = todayStr();

  const users = state.users;

  const stats = useMemo(() => users.map(user => {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayPts = pointsInRange(state.habitLogs, state.tasks, state.habits, user.id, todayStart, now);
    const weekPts  = pointsInRange(state.habitLogs, state.tasks, state.habits, user.id, weekStart, now);
    const monthPts = pointsInRange(state.habitLogs, state.tasks, state.habits, user.id, monthStart, now);

    // habits done today
    const dailyHabits = state.habits.filter(h => h.active && h.frequency === 'daily' && h.assignedTo.includes(user.id));
    const doneTodayCount = dailyHabits.filter(h =>
      state.habitLogs.some(l => l.habitId === h.id && l.userId === user.id && l.date === today),
    ).length;

    // category breakdown
    const catPoints: Record<string, number> = {};
    state.habitLogs.filter(l => l.userId === user.id).forEach(l => {
      const h = state.habits.find(h => h.id === l.habitId);
      if (!h) return;
      catPoints[h.category] = (catPoints[h.category] ?? 0) + h.points * l.completedCount;
    });

    const xp = getXPProgress(user.xp);
    return { user, todayPts, weekPts, monthPts, doneTodayCount, dailyTotal: dailyHabits.length, catPoints, xp };
  }), [state]);

  const leader = stats.sort((a, b) => b.user.totalPoints - a.user.totalPoints)[0];
  const [s1, s2] = stats;
  const tied = s1 && s2 && s1.user.totalPoints === s2.user.totalPoints;

  // Radar data
  const allCategories = [...new Set(state.habits.map(h => h.category))];
  const radarData = allCategories.map(cat => {
    const entry: Record<string, string | number> = { category: CATEGORY_LABELS[cat] ?? cat };
    stats.forEach(s => { entry[s.user.name] = s.catPoints[cat] ?? 0; });
    return entry;
  });

  const COLORS = ['#6366f1', '#f72fb2'];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
          <Swords size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Duelo</h1>
          <p className="text-gray-500 text-sm">Competição amigável em tempo real</p>
        </div>
      </div>

      {/* VS Banner */}
      {s1 && s2 && (
        <div className="card bg-gradient-to-r from-primary-900/30 via-gray-900 to-secondary-900/30 border-none overflow-hidden relative">
          <div className="flex items-center justify-around">
            <UserBanner stat={s1} color={COLORS[0]} isLeading={!tied && s1.user.totalPoints > s2.user.totalPoints} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-black text-gray-600">VS</span>
              {tied ? (
                <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🤝 Empate!</span>
              ) : (
                <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  <Crown size={10} /> {leader.user.name} lidera
                </span>
              )}
            </div>
            <UserBanner stat={s2} color={COLORS[1]} isLeading={!tied && s2.user.totalPoints > s1.user.totalPoints} />
          </div>
        </div>
      )}

      {/* Comparison grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={stat.user.id} className="card space-y-4">
            <div className="flex items-center gap-3">
              <ProgressRing pct={stat.xp.pct} size={56} stroke={5} color={COLORS[idx]}>
                <span className="text-xl">{stat.user.avatar}</span>
              </ProgressRing>
              <div>
                <h3 className="font-bold text-gray-100 text-lg">{stat.user.name}</h3>
                <p className="text-xs text-gray-500">Nível {stat.user.level} · {getLevelTitle(stat.user.level)}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-black" style={{ color: COLORS[idx] }}>{stat.user.totalPoints}</p>
                <p className="text-xs text-gray-600">pontos</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Hoje" value={stat.todayPts} icon="⚡" color={COLORS[idx]} />
              <MiniStat label="Semana" value={stat.weekPts} icon="📅" color={COLORS[idx]} />
              <MiniStat label="Mês" value={stat.monthPts} icon="📆" color={COLORS[idx]} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Hábitos hoje</span>
                <span className="text-xs font-bold text-gray-300">{stat.doneTodayCount}/{stat.dailyTotal}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stat.dailyTotal ? (stat.doneTodayCount / stat.dailyTotal) * 100 : 0}%`,
                    background: COLORS[idx],
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="fire-flicker">🔥</span>
              <span className="text-sm font-semibold text-orange-400">{stat.user.streak} dias</span>
              <span className="text-xs text-gray-600">de sequência</span>
              <span className="ml-auto text-xs text-gray-600">Recorde: {stat.user.longestStreak}d</span>
            </div>
          </div>
        ))}
      </div>

      {/* Radar chart */}
      {radarData.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Desempenho por Categoria
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                {stats.map((s, i) => (
                  <Radar
                    key={s.user.id}
                    name={s.user.name}
                    dataKey={s.user.name}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend formatter={(v) => <span style={{ color: '#d1d5db', fontSize: 12 }}>{v}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="card">
        <h2 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
          <Star size={18} className="text-accent-400" />
          Conquistas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {state.badges.map(badge => {
            const earnedBy = badge.earnedBy.map(e => state.users.find(u => u.id === e.userId)?.name).filter(Boolean);
            const isEarned = badge.earnedBy.length > 0;
            return (
              <div key={badge.id} className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                isEarned
                  ? 'border-accent-500/30 bg-accent-500/10'
                  : 'border-gray-800 bg-gray-800/30 opacity-50'
              }`}>
                <span className={`text-3xl ${!isEarned ? 'grayscale' : ''}`}>{badge.emoji}</span>
                <p className="text-xs font-semibold text-gray-300 leading-tight">{badge.name}</p>
                <p className="text-[10px] text-gray-600 leading-snug">{badge.description}</p>
                {earnedBy.length > 0 && (
                  <p className="text-[10px] text-accent-400">{earnedBy.join(', ')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UserBanner({ stat, color, isLeading }: { stat: ReturnType<typeof useApp>['state']['users'][0] & any; color: string; isLeading: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {isLeading && <Crown size={16} style={{ color }} />}
      <span className="text-4xl">{stat.user.avatar}</span>
      <p className="font-bold text-gray-200">{stat.user.name}</p>
      <p className="text-2xl font-black" style={{ color }}>{stat.user.totalPoints}</p>
      <p className="text-xs text-gray-500">pontos</p>
    </div>
  );
}

function MiniStat({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-2 text-center">
      <span className="text-base">{icon}</span>
      <p className="text-base font-bold mt-0.5" style={{ color }}>{value}</p>
      <p className="text-[10px] text-gray-600">{label}</p>
    </div>
  );
}

import { useState } from 'react';
import { CheckCircle2, Circle, Star, Trophy, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr, pointsInRange, startOfWeek } from '../utils/gamification';
import MiniCalendar from '../components/MiniCalendar';
import ConfettiEffect from '../components/ConfettiEffect';

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export default function Dashboard() {
  const { state, dispatch, activeUser, isHabitDoneToday, syncing } = useApp();
  const today = todayStr();
  const [confetti, setConfetti] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);

  const todayHabits = state.habits.filter(h =>
    h.active && h.frequency === 'daily' && h.assignedTo.includes(state.activeUserId),
  );

  const pendingTasks = state.tasks.filter(t =>
    !t.completed && t.assignedTo.includes(state.activeUserId),
  );

  const completedToday = todayHabits.filter(h => isHabitDoneToday(h.id)).length;
  const completionPct = todayHabits.length > 0 ? Math.round((completedToday / todayHabits.length) * 100) : 0;

  const now = new Date();
  const weekStart = startOfWeek(now, state.settings.weekStartsOn);

  const getUserWeekPoints = (userId: string) =>
    pointsInRange(state.habitLogs, state.tasks, state.habits, userId, weekStart, now);

  const sortedUsers = [...state.users].sort((a, b) => b.totalPoints - a.totalPoints);

  const handleToggleHabit = (habitId: string) => {
    const wasCompleted = isHabitDoneToday(habitId);
    dispatch({ type: 'TOGGLE_HABIT', habitId, userId: state.activeUserId, date: today });
    if (!wasCompleted) setConfetti(true);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <ConfettiEffect trigger={confetti} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {greeting()}, <span className="gradient-text">{activeUser.name}</span>! {activeUser.avatar}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <Loader2 size={12} className="text-primary-400 animate-spin" />
              <span className="text-primary-400 text-xs">Sincronizando</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <span className="fire-flicker">🔥</span>
          <span className="text-orange-400 font-bold text-sm">{activeUser.streak}</span>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon="✅" label="Hábitos Hoje" value={`${completedToday}/${todayHabits.length}`} sub={`${completionPct}% concluído`} color="primary" />
        <StatTile icon="⭐" label="Pontos Totais" value={String(activeUser.totalPoints)} sub="acumulados" color="accent" />
        <StatTile icon="📅" label="Esta Semana" value={String(getUserWeekPoints(state.activeUserId))} sub="pontos" color="success" />
        <StatTile icon="🏆" label="Seu Nível" value={String(activeUser.level)} sub={`${activeUser.xp} XP`} color="secondary" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: Habits today + tasks */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's habits */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-100">Hábitos de Hoje</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {completedToday} de {todayHabits.length} concluídos
                </p>
              </div>
              {completedToday === todayHabits.length && todayHabits.length > 0 && (
                <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  🎉 Perfeito!
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            {todayHabits.length === 0 ? (
              <EmptyState icon="🌱" message="Nenhum hábito diário. Crie seu primeiro hábito!" />
            ) : (
              <div className="space-y-2">
                {todayHabits.map(habit => {
                  const done = isHabitDoneToday(habit.id);
                  return (
                    <button
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left active:scale-[0.98] ${
                        done
                          ? 'bg-emerald-500/10 border-emerald-500/30 opacity-80'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-2xl">{habit.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {habit.title}
                        </p>
                        {habit.description && (
                          <p className="text-xs text-gray-500 truncate">{habit.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="badge bg-accent-500/20 text-accent-400 border border-accent-500/20">
                          +{habit.points}pts
                        </span>
                        {done
                          ? <CheckCircle2 size={20} className="text-emerald-400 check-bounce" />
                          : <Circle size={20} className="text-gray-600" />
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-100">Tarefas Pendentes</h2>
              <span className="badge bg-gray-800 text-gray-400 border border-gray-700">
                {pendingTasks.length}
              </span>
            </div>
            {pendingTasks.length === 0 ? (
              <EmptyState icon="🎉" message="Tudo em dia! Sem tarefas pendentes." />
            ) : (
              <div className="space-y-2">
                {pendingTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                    <span className="text-xl">{task.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">{FREQ_LABELS[task.frequency] ?? task.frequency}</p>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'COMPLETE_TASK', taskId: task.id, userId: state.activeUserId })}
                      className="btn-success text-xs px-3 py-1.5 flex-shrink-0"
                    >
                      +{task.points}pts
                    </button>
                  </div>
                ))}
                {pendingTasks.length > 4 && (
                  <p className="text-center text-xs text-gray-500 py-1">+{pendingTasks.length - 4} mais tarefas</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Scoreboard + Calendar */}
        <div className="space-y-5">
          {/* Scoreboard */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-accent-400" />
              <h2 className="font-bold text-gray-100">Placar</h2>
            </div>
            <div className="space-y-3">
              {sortedUsers.map((user, idx) => {
                    const wk = getUserWeekPoints(user.id);
                return (
                  <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    user.id === state.activeUserId ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-gray-800/50'
                  }`}>
                    <span className="text-2xl">{['🥇','🥈','🥉'][idx] ?? '🏅'}</span>
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-200">{user.name}</p>
                      <p className="text-xs text-gray-500">+{wk}pts esta semana</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent-400">{user.totalPoints}</p>
                      <p className="text-[10px] text-gray-600">pontos</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Difference */}
            {state.users.length === 2 && (
              <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                <p className="text-xs text-gray-500">
                  {(() => {
                    const diff = Math.abs(state.users[0].totalPoints - state.users[1].totalPoints);
                    const leader = sortedUsers[0].name;
                    return diff === 0 ? '🤝 Empate!' : `${leader} está ${diff}pts à frente`;
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Calendar */}
          <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          {/* Badges preview */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-accent-400" />
              <h2 className="font-semibold text-gray-200 text-sm">Conquistas</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {state.badges.slice(0, 8).map(badge => {
                const earned = badge.earnedBy.some(e => e.userId === state.activeUserId);
                return (
                  <div
                    key={badge.id}
                    title={`${badge.name}: ${badge.description}`}
                    className={`aspect-square flex items-center justify-center rounded-xl text-2xl transition-all ${
                      earned ? 'bg-accent-500/20 border border-accent-500/30' : 'bg-gray-800/50 grayscale opacity-40'
                    }`}
                  >
                    {badge.emoji}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string;
  color: 'primary' | 'secondary' | 'accent' | 'success';
}) {
  const colors = {
    primary:   'bg-primary-500/10 border-primary-500/20 text-primary-400',
    secondary: 'bg-secondary-500/10 border-secondary-500/20 text-secondary-400',
    accent:    'bg-accent-500/10 border-accent-500/20 text-accent-400',
    success:   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  };
  return (
    <div className={`card border ${colors[color]} flex flex-col gap-1`}>
      <span className="text-2xl">{icon}</span>
      <p className={`text-2xl font-bold ${colors[color].split(' ')[2]}`}>{value}</p>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-xs text-gray-600">{sub}</p>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

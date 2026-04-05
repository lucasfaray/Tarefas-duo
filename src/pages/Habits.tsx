import { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Habit, Frequency } from '../types';
import Modal from '../components/Modal';
import HabitForm from '../components/HabitForm';
import { todayStr, calculateStreak } from '../utils/gamification';
import ConfettiEffect from '../components/ConfettiEffect';

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal',
};

export default function Habits() {
  const { state, dispatch, isHabitDoneToday } = useApp();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editHabit, setEditHabit] = useState<Habit | undefined>();
  const [filter, setFilter] = useState<'all' | 'mine' | Frequency>('mine');
  const [confetti, setConfetti] = useState(false);
  const today = todayStr();

  const filtered = state.habits.filter(h => {
    if (!h.active) return false;
    if (filter === 'mine') return h.assignedTo.includes(state.activeUserId);
    if (filter === 'all') return true;
    return h.frequency === filter;
  });

  const handleToggle = (habitId: string) => {
    const wasDone = isHabitDoneToday(habitId);
    dispatch({ type: 'TOGGLE_HABIT', habitId, userId: state.activeUserId, date: today });
    if (!wasDone) setConfetti(true);
  };

  const handleSave = (habit: Habit) => {
    if (modal === 'edit') {
      dispatch({ type: 'UPDATE_HABIT', habit });
    } else {
      dispatch({ type: 'ADD_HABIT', habit });
    }
    setModal(null);
    setEditHabit(undefined);
  };

  const handleDelete = (habitId: string) => {
    if (window.confirm('Remover este hábito? O histórico será perdido.')) {
      dispatch({ type: 'DELETE_HABIT', habitId });
    }
  };

  const openEdit = (habit: Habit) => {
    setEditHabit(habit);
    setModal('edit');
  };

  const groups: Record<Frequency, Habit[]> = { daily: [], weekly: [], monthly: [] };
  filtered.forEach(h => groups[h.frequency].push(h));

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <ConfettiEffect trigger={confetti} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Hábitos</h1>
          <p className="text-gray-500 text-sm mt-1">Construa sua rotina dia a dia</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} /> Novo Hábito
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'mine', label: '👤 Meus' },
          { value: 'all',  label: '👥 Todos' },
          { value: 'daily', label: '📅 Diários' },
          { value: 'weekly', label: '📆 Semanais' },
          { value: 'monthly', label: '🗓️ Mensais' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`btn text-xs px-3 py-1.5 ${
              filter === f.value
                ? 'bg-primary-600 text-white border border-primary-500'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([freq, habits]) => {
        if (habits.length === 0) return null;
        return (
          <div key={freq} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {FREQ_LABELS[freq as Frequency]}
            </h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {habits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  users={state.users}
                  done={isHabitDoneToday(habit.id)}
                  streak={calculateStreak(state.habitLogs, habit.id, state.activeUserId)}
                  onToggle={() => handleToggle(habit.id)}
                  onEdit={() => openEdit(habit)}
                  onDelete={() => handleDelete(habit.id)}
                  isCurrentUser={habit.assignedTo.includes(state.activeUserId)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-5xl">🌱</span>
          <p className="text-gray-400 font-medium">Nenhum hábito encontrado</p>
          <p className="text-gray-600 text-sm">Crie seu primeiro hábito para começar!</p>
          <button className="btn-primary mt-2" onClick={() => setModal('create')}>
            <Plus size={16} /> Criar Hábito
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal !== null}
        onClose={() => { setModal(null); setEditHabit(undefined); }}
        title={modal === 'edit' ? 'Editar Hábito' : 'Novo Hábito'}
        size="md"
      >
        <HabitForm
          initial={editHabit}
          onSave={handleSave}
          onCancel={() => { setModal(null); setEditHabit(undefined); }}
        />
      </Modal>
    </div>
  );
}

interface HabitCardProps {
  habit: Habit;
  users: ReturnType<typeof useApp>['state']['users'];
  done: boolean;
  streak: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isCurrentUser: boolean;
}

function HabitCard({ habit, users, done, streak, onToggle, onEdit, onDelete, isCurrentUser }: HabitCardProps) {
  const assignedUsers = users.filter(u => habit.assignedTo.includes(u.id));

  return (
    <div className={`card group flex flex-col gap-3 transition-all ${
      done ? 'opacity-75' : ''
    } hover:border-gray-700`}>
      {/* Top */}
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          disabled={!isCurrentUser}
          className={`text-3xl flex-shrink-0 transition-transform active:scale-90 ${!isCurrentUser ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {habit.emoji}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-sm font-semibold leading-snug ${done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
              {habit.title}
            </p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={onEdit} className="btn-ghost p-1 rounded-lg text-gray-500 hover:text-gray-300">
                <Pencil size={14} />
              </button>
              <button onClick={onDelete} className="btn-ghost p-1 rounded-lg text-gray-500 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {habit.description && (
            <p className="text-xs text-gray-600 mt-0.5 truncate">{habit.description}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            habit.priority === 'high' ? 'bg-red-500' :
            habit.priority === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
          }`} />
          <span className="text-xs text-gray-500">{FREQ_LABELS[habit.frequency]}</span>
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-orange-400 font-medium">
              🔥{streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Assigned users */}
          <div className="flex -space-x-1">
            {assignedUsers.map(u => (
              <span key={u.id} title={u.name} className="text-sm">{u.avatar}</span>
            ))}
          </div>
          {/* Points */}
          <span className="badge bg-accent-500/20 text-accent-400 border border-accent-500/20">
            +{habit.points}pts
          </span>
          {/* Done indicator */}
          {isCurrentUser && (
            done
              ? <CheckCircle2 size={18} className="text-emerald-400" />
              : <Circle size={18} className="text-gray-700" />
          )}
        </div>
      </div>
    </div>
  );
}

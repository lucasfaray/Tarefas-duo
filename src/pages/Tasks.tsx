import { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Task, Frequency } from '../types';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import ConfettiEffect from '../components/ConfettiEffect';

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal',
};
const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function Tasks() {
  const { state, dispatch } = useApp();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [filter, setFilter] = useState<'all' | 'mine' | 'pending' | 'done'>('pending');
  const [confetti, setConfetti] = useState(false);

  const filtered = state.tasks.filter(t => {
    if (filter === 'mine') return t.assignedTo.includes(state.activeUserId) && !t.completed;
    if (filter === 'pending') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const handleComplete = (taskId: string) => {
    dispatch({ type: 'COMPLETE_TASK', taskId, userId: state.activeUserId });
    setConfetti(true);
  };

  const handleUncomplete = (taskId: string) => {
    dispatch({ type: 'UNCOMPLETE_TASK', taskId });
  };

  const handleSave = (task: Task) => {
    if (modal === 'edit') {
      dispatch({ type: 'UPDATE_TASK', task });
    } else {
      dispatch({ type: 'ADD_TASK', task });
    }
    setModal(null);
    setEditTask(undefined);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('Remover esta tarefa?')) {
      dispatch({ type: 'DELETE_TASK', taskId });
    }
  };

  const groups: Record<Frequency, Task[]> = { daily: [], weekly: [], monthly: [] };
  filtered.forEach(t => groups[t.frequency].push(t));

  const stats = {
    total: state.tasks.length,
    done: state.tasks.filter(t => t.completed).length,
    mine: state.tasks.filter(t => t.assignedTo.includes(state.activeUserId) && !t.completed).length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <ConfettiEffect trigger={confetti} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Tarefas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats.done}/{stats.total} concluídas · {stats.mine} pendentes para você
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} /> Nova Tarefa
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-gray-100">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-red-400">{stats.total - stats.done}</p>
          <p className="text-xs text-gray-500">Pendentes</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-emerald-400">{stats.done}</p>
          <p className="text-xs text-gray-500">Concluídas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'pending', label: '⏳ Pendentes' },
          { value: 'mine',    label: '👤 Minhas'   },
          { value: 'done',    label: '✅ Concluídas'},
          { value: 'all',     label: '📋 Todas'    },
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
      {Object.entries(groups).map(([freq, tasks]) => {
        if (tasks.length === 0) return null;
        return (
          <div key={freq} className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {FREQ_LABELS[freq as Frequency]}
            </h2>
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  users={state.users}
                  activeUserId={state.activeUserId}
                  onComplete={() => handleComplete(task.id)}
                  onUncomplete={() => handleUncomplete(task.id)}
                  onEdit={() => { setEditTask(task); setModal('edit'); }}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <span className="text-5xl">🎯</span>
          <p className="text-gray-400 font-medium">Nenhuma tarefa aqui</p>
          <p className="text-gray-600 text-sm">
            {filter === 'done' ? 'Ainda sem tarefas concluídas.' : 'Crie sua primeira tarefa!'}
          </p>
          {filter !== 'done' && (
            <button className="btn-primary mt-2" onClick={() => setModal('create')}>
              <Plus size={16} /> Criar Tarefa
            </button>
          )}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => { setModal(null); setEditTask(undefined); }}
        title={modal === 'edit' ? 'Editar Tarefa' : 'Nova Tarefa'}
        size="md"
      >
        <TaskForm
          initial={editTask}
          onSave={handleSave}
          onCancel={() => { setModal(null); setEditTask(undefined); }}
        />
      </Modal>
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  users: ReturnType<typeof useApp>['state']['users'];
  activeUserId: string;
  onComplete: () => void;
  onUncomplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskRow({ task, users, activeUserId, onComplete, onUncomplete, onEdit, onDelete }: TaskRowProps) {
  const assignedUsers = users.filter(u => task.assignedTo.includes(u.id));
  const completedByUser = task.completedBy ? users.find(u => u.id === task.completedBy) : null;
  const canComplete = !task.completed && task.assignedTo.includes(activeUserId);

  return (
    <div className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${
      task.completed
        ? 'bg-gray-900/50 border-gray-800 opacity-70'
        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
    }`}>
      <span className="text-2xl flex-shrink-0">{task.emoji}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
            {task.title}
          </p>
          <span className={`badge border text-xs ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {task.description && (
            <p className="text-xs text-gray-600 truncate">{task.description}</p>
          )}
          {task.dueDate && !task.completed && (
            <p className="text-xs text-gray-500 flex-shrink-0">
              📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
            </p>
          )}
          {task.completed && completedByUser && (
            <p className="text-xs text-emerald-600">
              ✓ por {completedByUser.avatar} {completedByUser.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Assigned */}
        <div className="hidden sm:flex -space-x-1">
          {assignedUsers.map(u => (
            <span key={u.id} title={u.name} className="text-sm">{u.avatar}</span>
          ))}
        </div>

        {/* Points */}
        <span className="badge bg-accent-500/20 text-accent-400 border border-accent-500/20 hidden sm:flex">
          +{task.points}pts
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="btn-ghost p-1.5 rounded-lg text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="btn-ghost p-1.5 rounded-lg text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
          {task.completed ? (
            <button onClick={onUncomplete} className="btn-ghost p-1.5 rounded-lg text-emerald-600 hover:text-gray-400">
              <RotateCcw size={16} />
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={!canComplete}
              className={`btn p-1.5 rounded-lg transition-all ${
                canComplete ? 'text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-800 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

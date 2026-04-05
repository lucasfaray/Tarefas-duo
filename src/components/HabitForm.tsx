import { useState } from 'react';
import type { Habit, Category, Frequency, Priority } from '../types';
import { useApp } from '../context/AppContext';

const EMOJIS = ['💧','💪','✨','💊','🧘','📚','🏃','🍎','😴','🧹','💰','📝','🎯','🌱','☕','🎨','🎵','🚴','🏊','🧠'];
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'health',       label: '❤️ Saúde'         },
  { value: 'fitness',      label: '💪 Fitness'        },
  { value: 'beauty',       label: '✨ Beleza'         },
  { value: 'nutrition',    label: '🥗 Nutrição'       },
  { value: 'productivity', label: '📊 Produtividade'  },
  { value: 'mindfulness',  label: '🧘 Mindfulness'   },
  { value: 'social',       label: '👥 Social'         },
  { value: 'finance',      label: '💰 Finanças'       },
  { value: 'learning',     label: '📚 Aprendizado'    },
  { value: 'other',        label: '🔮 Outro'          },
];

interface Props {
  initial?: Partial<Habit>;
  onSave: (h: Habit) => void;
  onCancel: () => void;
}

export default function HabitForm({ initial, onSave, onCancel }: Props) {
  const { state } = useApp();
  const [form, setForm] = useState({
    title:       initial?.title       ?? '',
    description: initial?.description ?? '',
    emoji:       initial?.emoji       ?? '⭐',
    category:    initial?.category    ?? 'health' as Category,
    frequency:   initial?.frequency   ?? 'daily' as Frequency,
    targetCount: initial?.targetCount ?? 1,
    points:      initial?.points      ?? 10,
    priority:    initial?.priority    ?? 'medium' as Priority,
    assignedTo:  initial?.assignedTo  ?? state.users.map(u => u.id),
    reminderTime: initial?.reminderTime ?? '',
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleUser = (uid: string) => {
    set('assignedTo', form.assignedTo.includes(uid)
      ? form.assignedTo.filter(id => id !== uid)
      : [...form.assignedTo, uid]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const habit: Habit = {
      id:          initial?.id ?? `h_${Date.now()}`,
      active:      initial?.active ?? true,
      createdAt:   initial?.createdAt ?? new Date().toISOString(),
      ...form,
    };
    onSave(habit);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* Emoji picker */}
      <div>
        <label className="label">Ícone</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(em => (
            <button
              key={em} type="button"
              onClick={() => set('emoji', em)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border ${
                form.emoji === em
                  ? 'border-primary-500 bg-primary-500/20'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >{em}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Nome do Hábito *</label>
        <input className="input" placeholder="ex: Beber 2L de água..." value={form.title}
          onChange={e => set('title', e.target.value)} required />
      </div>

      <div>
        <label className="label">Descrição</label>
        <textarea className="input resize-none" rows={2} placeholder="Detalhes opcionais..."
          value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Categoria</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value as Category)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Frequência</label>
          <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value as Frequency)}>
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Pontos por conclusão</label>
          <input className="input" type="number" min={1} max={100} value={form.points}
            onChange={e => set('points', Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Prioridade</label>
          <select className="input" value={form.priority} onChange={e => set('priority', e.target.value as Priority)}>
            <option value="high">🔴 Alta</option>
            <option value="medium">🟡 Média</option>
            <option value="low">🟢 Baixa</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Atribuir a</label>
        <div className="flex gap-2">
          {state.users.map(user => (
            <button
              key={user.id} type="button"
              onClick={() => toggleUser(user.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                form.assignedTo.includes(user.id)
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span>{user.avatar}</span>
              <span className="text-sm font-medium">{user.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Lembrete (opcional)</label>
        <input className="input" type="time" value={form.reminderTime}
          onChange={e => set('reminderTime', e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">
          {initial?.id ? 'Salvar Alterações' : 'Criar Hábito'}
        </button>
        <button type="button" className="btn-ghost flex-1" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

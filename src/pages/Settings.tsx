import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Users, RotateCcw, Trophy, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { User } from '../types';
import Modal from '../components/Modal';

const AVATARS = ['👩','👨','👧','👦','🧑','👩‍🦰','👨‍🦱','🧔','👩‍🦳','🧑‍💻','🦸','🧙','👸','🤴','🥷'];

export default function Settings() {
  const { state, dispatch } = useApp();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: '', avatar: '' });

  const openEditUser = (user: User) => {
    setEditUser(user);
    setUserForm({ name: user.name, avatar: user.avatar });
  };

  const handleSaveUser = () => {
    if (!editUser || !userForm.name.trim()) return;
    dispatch({ type: 'UPDATE_USER', user: { ...editUser, name: userForm.name.trim(), avatar: userForm.avatar } });
    setEditUser(null);
  };

  const handleReset = () => {
    if (window.confirm('Resetar todos os dados? Isso apagará todo o progresso!')) {
      dispatch({ type: 'RESET' });
    }
  };

  const { settings } = state;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Personalize seu RoutineDuel</p>
      </div>

      {/* Players */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-primary-400" />
          <h2 className="font-bold text-gray-100">Jogadores</h2>
        </div>
        {state.users.map(user => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
            <span className="text-3xl">{user.avatar}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-200">{user.name}</p>
              <p className="text-xs text-gray-500">Nível {user.level} · {user.xp} XP · {user.totalPoints} pts</p>
            </div>
            <button className="btn-ghost text-xs px-3 py-1.5" onClick={() => openEditUser(user)}>
              Editar
            </button>
          </div>
        ))}
      </section>

      {/* App settings */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon size={18} className="text-secondary-400" />
          <h2 className="font-bold text-gray-100">App</h2>
        </div>

        <ToggleRow
          label="Modo Competição"
          description="Mostrar placar e comparativo entre jogadores"
          icon={<Trophy size={16} className="text-accent-400" />}
          value={settings.competitionMode}
          onChange={v => dispatch({ type: 'UPDATE_SETTINGS', settings: { competitionMode: v } })}
        />
        <ToggleRow
          label="Mostrar Tarefas Concluídas"
          description="Exibir tarefas já concluídas na listagem"
          icon={<Palette size={16} className="text-primary-400" />}
          value={settings.showCompletedTasks}
          onChange={v => dispatch({ type: 'UPDATE_SETTINGS', settings: { showCompletedTasks: v } })}
        />
        <ToggleRow
          label="Notificações"
          description="Lembretes de hábitos e tarefas"
          icon={<Bell size={16} className="text-secondary-400" />}
          value={settings.notificationsEnabled}
          onChange={v => dispatch({ type: 'UPDATE_SETTINGS', settings: { notificationsEnabled: v } })}
        />

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Semana começa em</p>
              <p className="text-xs text-gray-600">Para cálculo de pontos semanais</p>
            </div>
          </div>
          <select
            className="input w-auto text-xs py-1.5 px-3"
            value={settings.weekStartsOn}
            onChange={e => dispatch({ type: 'UPDATE_SETTINGS', settings: { weekStartsOn: Number(e.target.value) as 0 | 1 } })}
          >
            <option value={1}>Segunda-feira</option>
            <option value={0}>Domingo</option>
          </select>
        </div>
      </section>

      {/* Danger zone */}
      <section className="card border-red-900/50 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <RotateCcw size={18} className="text-red-400" />
          <h2 className="font-bold text-red-400">Zona de Perigo</h2>
        </div>
        <p className="text-sm text-gray-500">Estas ações são irreversíveis. Tenha cuidado.</p>
        <button className="btn-danger" onClick={handleReset}>
          <RotateCcw size={16} /> Resetar Todos os Dados
        </button>
      </section>

      {/* About */}
      <section className="card text-center space-y-1 py-6">
        <p className="text-2xl">⚔️</p>
        <p className="font-bold gradient-text text-lg">RoutineDuel</p>
        <p className="text-xs text-gray-600">v1.0.0 · Feito com ❤️ para casais produtivos</p>
      </section>

      {/* Edit user modal */}
      <Modal open={editUser !== null} onClose={() => setEditUser(null)} title="Editar Jogador" size="sm">
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Nome</label>
            <input className="input" value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setUserForm(f => ({ ...f, avatar: av }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border ${
                    userForm.avatar === av ? 'border-primary-500 bg-primary-500/20' : 'border-gray-700 hover:border-gray-500'
                  }`}
                >{av}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={handleSaveUser}>Salvar</button>
            <button className="btn-ghost flex-1" onClick={() => setEditUser(null)}>Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ToggleRow({ label, description, icon, value, onChange }: {
  label: string; description: string; icon: React.ReactNode;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-primary-600' : 'bg-gray-700'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

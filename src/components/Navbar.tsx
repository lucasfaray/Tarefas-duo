import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Repeat2, CheckSquare, Trophy, BarChart2, Settings, Swords } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getXPProgress } from '../utils/gamification';

const links = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits',    icon: Repeat2,         label: 'Hábitos'   },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tarefas'   },
  { to: '/duel',      icon: Trophy,          label: 'Duelo'     },
  { to: '/stats',     icon: BarChart2,       label: 'Estatísticas' },
  { to: '/settings',  icon: Settings,        label: 'Config'    },
];

export default function Navbar() {
  const { state, activeUser, dispatch } = useApp();
  const xp = getXPProgress(activeUser.xp);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-900 border-r border-gray-800 fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
            <Swords size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text leading-none">RoutineDuel</h1>
            <p className="text-xs text-gray-500 mt-0.5">Duo Produtivo</p>
          </div>
        </div>

        {/* User switcher */}
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-2 px-2">Jogador Ativo</p>
          <div className="flex gap-2">
            {state.users.map(user => (
              <button
                key={user.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_USER', userId: user.id })}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all border ${
                  user.id === state.activeUserId
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-transparent'
                }`}
              >
                <span className="text-2xl">{user.avatar}</span>
                <span className="text-xs font-semibold text-gray-300">{user.name}</span>
                <span className="text-xs text-accent-400 font-bold">{user.totalPoints}pts</span>
              </button>
            ))}
          </div>
        </div>

        {/* XP bar */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Nível {activeUser.level}</span>
            <span className="text-xs text-gray-500">{xp.current}/{xp.required} XP</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full xp-bar-fill transition-all"
              style={{ width: `${xp.pct}%` }}
            />
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Streak */}
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2">
            <span className="fire-flicker text-2xl">🔥</span>
            <div>
              <p className="text-sm font-bold text-gray-200">{activeUser.streak} dias seguidos</p>
              <p className="text-xs text-gray-500">Melhor: {activeUser.longestStreak} dias</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur border-t border-gray-800">
        <div className="flex items-center justify-around px-2 py-2">
          {links.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-primary-400' : 'text-gray-500'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Swords size={16} className="text-white" />
            </div>
            <span className="font-bold gradient-text">RoutineDuel</span>
          </div>
          <div className="flex items-center gap-2">
            {state.users.map(user => (
              <button
                key={user.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_USER', userId: user.id })}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  user.id === state.activeUserId
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                    : 'border-gray-700 text-gray-400'
                }`}
              >
                <span>{user.avatar}</span>
                <span>{user.totalPoints}pts</span>
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}

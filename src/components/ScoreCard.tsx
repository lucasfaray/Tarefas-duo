import type { User } from '../types';
import { getXPProgress, getLevelTitle, RANK_ICONS } from '../utils/gamification';
import ProgressRing from './ProgressRing';

interface Props {
  user: User;
  rank: number;
  isActive?: boolean;
  points: number;
  weekPoints: number;
  streak: number;
  onClick?: () => void;
}

const colorMap: Record<string, { ring: string; badge: string; border: string }> = {
  primary:   { ring: '#6366f1', badge: 'bg-primary-500/20 text-primary-300 border-primary-500/30',   border: 'border-primary-500/40'   },
  secondary: { ring: '#f72fb2', badge: 'bg-secondary-500/20 text-secondary-300 border-secondary-500/30', border: 'border-secondary-500/40' },
};

export default function ScoreCard({ user, rank, isActive, points, weekPoints, streak, onClick }: Props) {
  const xp = getXPProgress(user.xp);
  const colors = colorMap[user.color] ?? colorMap.primary;

  return (
    <div
      onClick={onClick}
      className={`card flex flex-col gap-4 cursor-pointer transition-all hover:border-gray-600 ${
        isActive ? `border ${colors.border} shadow-lg` : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <ProgressRing pct={xp.pct} size={64} stroke={5} color={colors.ring}>
            <span className="text-2xl">{user.avatar}</span>
          </ProgressRing>
          <span className="absolute -bottom-1 -right-1 text-lg">{RANK_ICONS[rank] ?? '🏅'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-100">{user.name}</h3>
            {isActive && (
              <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">Você</span>
            )}
          </div>
          <p className="text-xs text-gray-500">Nível {user.level} · {getLevelTitle(user.level)}</p>
          <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden w-full">
            <div className="h-full rounded-full xp-bar-fill" style={{ width: `${xp.pct}%`, background: colors.ring }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-800/50 rounded-xl py-2 px-1">
          <p className="text-xl font-bold text-accent-400">{points}</p>
          <p className="text-[10px] text-gray-500 leading-tight">Pontos Totais</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl py-2 px-1">
          <p className="text-xl font-bold text-emerald-400">{weekPoints}</p>
          <p className="text-[10px] text-gray-500 leading-tight">Esta Semana</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl py-2 px-1">
          <p className="text-xl font-bold text-orange-400">{streak}<span className="text-sm">🔥</span></p>
          <p className="text-[10px] text-gray-500 leading-tight">Sequência</p>
        </div>
      </div>
    </div>
  );
}

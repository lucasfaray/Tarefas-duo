import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayStr } from '../utils/gamification';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAY_NAMES = ['D','S','T','Q','Q','S','S'];

interface Props {
  onSelectDate?: (date: string) => void;
  selectedDate?: string;
}

export default function MiniCalendar({ onSelectDate, selectedDate }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const { state, getHabitLogsForDate } = useApp();
  const todayISO = todayStr();

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getDateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const getScore = (dateStr: string): number => {
    const logs = getHabitLogsForDate(dateStr);
    return logs.reduce((acc, l) => {
      const habit = state.habits.find(h => h.id === l.habitId);
      return acc + (habit ? habit.points * l.completedCount : 0);
    }, 0);
  };

  const scoreToBg = (score: number) => {
    if (score === 0) return '';
    if (score < 20) return 'bg-primary-900/60';
    if (score < 40) return 'bg-primary-700/60';
    if (score < 60) return 'bg-primary-600/80';
    return 'bg-primary-500';
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  // pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-ghost p-1.5 rounded-lg"><ChevronLeft size={16} /></button>
        <h3 className="text-sm font-semibold text-gray-200">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button onClick={nextMonth} className="btn-ghost p-1.5 rounded-lg"><ChevronRight size={16} /></button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-gray-600 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const dateStr = getDateStr(day);
          const isToday = dateStr === todayISO;
          const isSelected = dateStr === selectedDate;
          const score = getScore(dateStr);
          const scoreBg = scoreToBg(score);
          const isFuture = dateStr > todayISO;

          return (
            <button
              key={idx}
              onClick={() => !isFuture && onSelectDate?.(dateStr)}
              disabled={isFuture}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                ${isFuture ? 'text-gray-700 cursor-default' : 'cursor-pointer hover:bg-white/10'}
                ${isToday ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-gray-900' : ''}
                ${isSelected && !isToday ? 'ring-2 ring-secondary-500 ring-offset-1 ring-offset-gray-900' : ''}
                ${scoreBg || (isFuture ? '' : 'hover:bg-gray-800')}
                ${!isFuture && score > 0 ? 'text-white' : isToday ? 'text-primary-300' : 'text-gray-400'}
              `}
            >
              {day}
              {score > 0 && !isFuture && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
        <span className="text-xs text-gray-500">Atividade:</span>
        <div className="flex gap-1">
          {['bg-primary-900/60','bg-primary-700/60','bg-primary-600/80','bg-primary-500'].map((bg, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${bg}`} />
          ))}
        </div>
        <span className="text-xs text-gray-600">Baixo → Alto</span>
      </div>
    </div>
  );
}

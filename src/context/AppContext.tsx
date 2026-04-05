import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, Habit, HabitLog, Task, User } from '../types';
import { loadState, saveState } from '../utils/storage';
import { createSeedState } from '../utils/seed';
import { todayStr, getLevelFromXP } from '../utils/gamification';

// ────────────────────────────── Actions ──────────────────────────────────────

type Action =
  | { type: 'SET_ACTIVE_USER'; userId: string }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habit: Habit }
  | { type: 'DELETE_HABIT'; habitId: string }
  | { type: 'TOGGLE_HABIT'; habitId: string; userId: string; date: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'COMPLETE_TASK'; taskId: string; userId: string }
  | { type: 'UNCOMPLETE_TASK'; taskId: string }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppState['settings']> }
  | { type: 'RESET'; }

// ──────────────────────────── Reducer ────────────────────────────────────────

function awardXP(user: User, amount: number): User {
  const newXP = user.xp + amount;
  const newLevel = getLevelFromXP(newXP);
  return { ...user, xp: newXP, level: newLevel, totalPoints: user.totalPoints + amount };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'SET_ACTIVE_USER':
      return { ...state, activeUserId: action.userId };

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };

    case 'UPDATE_HABIT':
      return { ...state, habits: state.habits.map(h => h.id === action.habit.id ? action.habit : h) };

    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.habitId),
        habitLogs: state.habitLogs.filter(l => l.habitId !== action.habitId),
      };

    case 'TOGGLE_HABIT': {
      const { habitId, userId, date } = action;
      const existing = state.habitLogs.find(
        l => l.habitId === habitId && l.userId === userId && l.date === date,
      );
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit) return state;

      let newLogs: HabitLog[];
      let usersDelta: User[];

      if (existing) {
        // Un-complete
        newLogs = state.habitLogs.filter(l => !(l.habitId === habitId && l.userId === userId && l.date === date));
        usersDelta = state.users.map(u =>
          u.id === userId
            ? { ...u, totalPoints: Math.max(0, u.totalPoints - habit.points), xp: Math.max(0, u.xp - habit.points) }
            : u,
        );
      } else {
        // Complete
        const newLog: HabitLog = {
          id: `log_${habitId}_${userId}_${date}_${Date.now()}`,
          habitId, userId, date, completedCount: 1,
          completedAt: new Date().toISOString(),
        };
        newLogs = [...state.habitLogs, newLog];
        usersDelta = state.users.map(u =>
          u.id === userId ? awardXP(u, habit.points) : u,
        );
      }

      return { ...state, habitLogs: newLogs, users: usersDelta };
    }

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.taskId) };

    case 'COMPLETE_TASK': {
      const { taskId, userId } = action;
      const task = state.tasks.find(t => t.id === taskId);
      if (!task || task.completed) return state;
      const newTasks = state.tasks.map(t =>
        t.id === taskId
          ? { ...t, completed: true, completedBy: userId, completedAt: new Date().toISOString() }
          : t,
      );
      const newUsers = state.users.map(u => u.id === userId ? awardXP(u, task.points) : u);
      return { ...state, tasks: newTasks, users: newUsers };
    }

    case 'UNCOMPLETE_TASK': {
      const task = state.tasks.find(t => t.id === action.taskId);
      if (!task || !task.completed) return state;
      const newTasks = state.tasks.map(t =>
        t.id === action.taskId
          ? { ...t, completed: false, completedBy: undefined, completedAt: undefined }
          : t,
      );
      const newUsers = state.users.map(u =>
        u.id === task.completedBy
          ? { ...u, totalPoints: Math.max(0, u.totalPoints - task.points), xp: Math.max(0, u.xp - task.points) }
          : u,
      );
      return { ...state, tasks: newTasks, users: newUsers };
    }

    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.user.id ? action.user : u) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'RESET':
      return createSeedState();

    default:
      return state;
  }
}

// ──────────────────────────── Context ────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeUser: User;
  isHabitDoneToday: (habitId: string, userId?: string) => boolean;
  isHabitDoneOnDate: (habitId: string, userId: string, date: string) => boolean;
  getHabitLogsForDate: (date: string) => HabitLog[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadState();
    return saved ?? createSeedState();
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeUser = state.users.find(u => u.id === state.activeUserId) ?? state.users[0];

  const isHabitDoneOnDate = useCallback((habitId: string, userId: string, date: string) => {
    return state.habitLogs.some(l => l.habitId === habitId && l.userId === userId && l.date === date);
  }, [state.habitLogs]);

  const isHabitDoneToday = useCallback((habitId: string, userId?: string) => {
    const uid = userId ?? state.activeUserId;
    return isHabitDoneOnDate(habitId, uid, todayStr());
  }, [state.habitLogs, state.activeUserId, isHabitDoneOnDate]);

  const getHabitLogsForDate = useCallback((date: string) => {
    return state.habitLogs.filter(l => l.date === date);
  }, [state.habitLogs]);

  return (
    <AppContext.Provider value={{ state, dispatch, activeUser, isHabitDoneToday, isHabitDoneOnDate, getHabitLogsForDate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

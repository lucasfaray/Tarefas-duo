import React, {
  createContext, useContext, useReducer, useEffect,
  useCallback, useRef,
} from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AppState, Habit, HabitLog, Task, User } from '../types';
import { createSeedState } from '../utils/seed';
import { todayStr, getLevelFromXP } from '../utils/gamification';
import {
  fetchRemoteState, pushRemoteState,
  subscribeRemoteState, unsubscribeRemoteState,
} from '../utils/remoteState';

// ─── env helpers ────────────────────────────────────────────────────────────
const DUO_ID = import.meta.env.VITE_DUO_ID as string | undefined;

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
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'RESET' };

// ──────────────────────────── Reducer ────────────────────────────────────────

function awardXP(user: User, amount: number): User {
  const newXP = user.xp + amount;
  return { ...user, xp: newXP, level: getLevelFromXP(newXP), totalPoints: user.totalPoints + amount };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'HYDRATE':
      return action.state;

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

      if (existing) {
        return {
          ...state,
          habitLogs: state.habitLogs.filter(
            l => !(l.habitId === habitId && l.userId === userId && l.date === date),
          ),
          users: state.users.map(u =>
            u.id === userId
              ? { ...u, totalPoints: Math.max(0, u.totalPoints - habit.points), xp: Math.max(0, u.xp - habit.points) }
              : u,
          ),
        };
      }
      return {
        ...state,
        habitLogs: [
          ...state.habitLogs,
          {
            id: `log_${habitId}_${userId}_${date}_${Date.now()}`,
            habitId, userId, date, completedCount: 1,
            completedAt: new Date().toISOString(),
          } as HabitLog,
        ],
        users: state.users.map(u => u.id === userId ? awardXP(u, habit.points) : u),
      };
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
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? { ...t, completed: true, completedBy: userId, completedAt: new Date().toISOString() }
            : t,
        ),
        users: state.users.map(u => u.id === userId ? awardXP(u, task.points) : u),
      };
    }

    case 'UNCOMPLETE_TASK': {
      const task = state.tasks.find(t => t.id === action.taskId);
      if (!task || !task.completed) return state;
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId
            ? { ...t, completed: false, completedBy: undefined, completedAt: undefined }
            : t,
        ),
        users: state.users.map(u =>
          u.id === task.completedBy
            ? { ...u, totalPoints: Math.max(0, u.totalPoints - task.points), xp: Math.max(0, u.xp - task.points) }
            : u,
        ),
      };
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
  syncing: boolean;
  isHabitDoneToday: (habitId: string, userId?: string) => boolean;
  isHabitDoneOnDate: (habitId: string, userId: string, date: string) => boolean;
  getHabitLogsForDate: (date: string) => HabitLog[];
}

const AppContext = createContext<AppContextValue | null>(null);

interface Props {
  children: React.ReactNode;
  /** Supabase user id of the currently logged-in user (for sync attribution) */
  authUserId: string;
}

export function AppProvider({ children, authUserId }: Props) {
  const [state, dispatch] = useReducer(reducer, createSeedState());
  const [syncing, setSyncing] = React.useState(true);

  // Refs to avoid stale closures in callbacks
  const stateRef       = useRef(state);
  const authUserIdRef  = useRef(authUserId);
  const channelRef     = useRef<RealtimeChannel | null>(null);
  const pushTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHydrated     = useRef(false);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { authUserIdRef.current = authUserId; }, [authUserId]);

  // ── Initial hydrate from Supabase ─────────────────────────────────────────
  useEffect(() => {
    if (!DUO_ID) {
      console.warn('[AppContext] VITE_DUO_ID not set — running in local-only mode.');
      setSyncing(false);
      return;
    }

    let cancelled = false;

    fetchRemoteState(DUO_ID).then(remote => {
      if (cancelled) return;
      if (remote) {
        dispatch({ type: 'HYDRATE', state: remote });
      }
      // If no remote state yet, seed state is used and will be pushed on first change
      isHydrated.current = true;
      setSyncing(false);
    });

    return () => { cancelled = true; };
  }, []);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!DUO_ID) return;

    const channel = subscribeRemoteState(DUO_ID, authUserId, (newState) => {
      dispatch({ type: 'HYDRATE', state: newState });
    });
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        unsubscribeRemoteState(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [authUserId]);

  // ── Debounced push on every state change ─────────────────────────────────
  useEffect(() => {
    if (!DUO_ID || !isHydrated.current) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

    pushTimerRef.current = setTimeout(() => {
      pushRemoteState(DUO_ID, stateRef.current, authUserIdRef.current);
    }, 1500); // 1.5s debounce — fast enough, safe enough

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────────
  const activeUser = state.users.find(u => u.id === state.activeUserId) ?? state.users[0];

  const isHabitDoneOnDate = useCallback((habitId: string, userId: string, date: string) =>
    state.habitLogs.some(l => l.habitId === habitId && l.userId === userId && l.date === date),
  [state.habitLogs]);

  const isHabitDoneToday = useCallback((habitId: string, userId?: string) =>
    isHabitDoneOnDate(habitId, userId ?? state.activeUserId, todayStr()),
  [state.habitLogs, state.activeUserId, isHabitDoneOnDate]);

  const getHabitLogsForDate = useCallback((date: string) =>
    state.habitLogs.filter(l => l.date === date),
  [state.habitLogs]);

  return (
    <AppContext.Provider value={{
      state, dispatch, activeUser, syncing,
      isHabitDoneToday, isHabitDoneOnDate, getHabitLogsForDate,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

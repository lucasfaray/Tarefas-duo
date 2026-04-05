export type Frequency = 'daily' | 'weekly' | 'monthly';
export type Category = 'health' | 'fitness' | 'beauty' | 'nutrition' | 'productivity' | 'mindfulness' | 'social' | 'finance' | 'learning' | 'other';
export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  avatar: string; // emoji
  color: string;  // tailwind color class
  level: number;
  xp: number;
  totalPoints: number;
  streak: number;
  longestStreak: number;
  joinedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  category: Category;
  frequency: Frequency;
  targetDays?: number[]; // 0=Sun ... 6=Sat (for weekly)
  targetCount: number;   // times per period (default 1)
  points: number;        // points per completion
  priority: Priority;
  assignedTo: string[];  // user ids
  reminderTime?: string; // "HH:MM"
  createdAt: string;
  active: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;      // ISO date "YYYY-MM-DD"
  completedCount: number;
  notes?: string;
  completedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  category: Category;
  frequency: Frequency;
  dueDate?: string;  // ISO date
  points: number;
  priority: Priority;
  assignedTo: string[]; // user ids
  completed: boolean;
  completedBy?: string; // user id
  completedAt?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: string; // description of how to earn
  earnedBy: { userId: string; earnedAt: string }[];
}

export interface AppState {
  users: User[];
  habits: Habit[];
  habitLogs: HabitLog[];
  tasks: Task[];
  badges: Badge[];
  activeUserId: string;
  settings: {
    notificationsEnabled: boolean;
    weekStartsOn: 0 | 1; // 0=Sun, 1=Mon
    showCompletedTasks: boolean;
    competitionMode: boolean;
  };
}

// Computed helpers
export interface UserStats {
  user: User;
  todayPoints: number;
  weekPoints: number;
  monthPoints: number;
  completionRate: number; // 0-100
  currentStreak: number;
  habitsCompletedToday: number;
  tasksCompletedTotal: number;
}

export type CalendarDay = {
  date: string;       // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  habits: { habit: Habit; completed: boolean; logs: HabitLog[] }[];
  tasks: Task[];
  totalPoints: number;
};

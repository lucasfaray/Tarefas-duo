import type { AppState, Badge } from '../types';
import { todayStr } from './gamification';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const BADGES: Badge[] = [
  { id: 'b1', name: 'Primeira Conquista', description: 'Complete sua primeira tarefa', emoji: '🌟', condition: 'tasks_1', earnedBy: [] },
  { id: 'b2', name: 'Semana Perfeita', description: 'Complete todos os hábitos por 7 dias seguidos', emoji: '🔥', condition: 'streak_7', earnedBy: [] },
  { id: 'b3', name: 'Madrugador', description: 'Complete uma tarefa antes das 8h', emoji: '🌅', condition: 'early_bird', earnedBy: [] },
  { id: 'b4', name: 'Hidratado', description: 'Beba água por 30 dias consecutivos', emoji: '💧', condition: 'water_30', earnedBy: [] },
  { id: 'b5', name: 'Atleta', description: 'Faça exercícios por 14 dias', emoji: '💪', condition: 'exercise_14', earnedBy: [] },
  { id: 'b6', name: 'Mestre da Rotina', description: 'Acumule 1000 pontos totais', emoji: '👑', condition: 'points_1000', earnedBy: [] },
  { id: 'b7', name: 'Duo Imbatível', description: 'Ambos completem todos os hábitos no mesmo dia', emoji: '❤️‍🔥', condition: 'duo_perfect_day', earnedBy: [] },
  { id: 'b8', name: 'Consistente', description: 'Complete hábitos por 30 dias', emoji: '🏅', condition: 'streak_30', earnedBy: [] },
];

export function createSeedState(): AppState {
  const today = todayStr();

  return {
    users: [
      {
        id: 'u1',
        name: 'Ivanna',
        avatar: '👩',
        color: 'secondary',
        level: 4,
        xp: 620,
        totalPoints: 83,
        streak: 5,
        longestStreak: 12,
        joinedAt: daysAgo(30),
      },
      {
        id: 'u2',
        name: 'Tiago',
        avatar: '👨',
        color: 'primary',
        level: 5,
        xp: 980,
        totalPoints: 114,
        streak: 8,
        longestStreak: 15,
        joinedAt: daysAgo(30),
      },
    ],
    activeUserId: 'u1',
    habits: [
      {
        id: 'h1', title: 'Meta de Água', description: 'Beber 2L de água por dia', emoji: '💧',
        category: 'health', frequency: 'daily', targetCount: 1, points: 10,
        priority: 'high', assignedTo: ['u1', 'u2'], active: true, createdAt: daysAgo(25),
      },
      {
        id: 'h2', title: 'Exercício', description: 'Pelo menos 30 minutos de atividade física', emoji: '💪',
        category: 'fitness', frequency: 'daily', targetCount: 1, points: 20,
        priority: 'high', assignedTo: ['u1', 'u2'], active: true, createdAt: daysAgo(20),
      },
      {
        id: 'h3', title: 'Skincare Noite', description: 'Rotina de skincare noturna', emoji: '✨',
        category: 'beauty', frequency: 'daily', targetCount: 1, points: 8,
        priority: 'medium', assignedTo: ['u1'], active: true, createdAt: daysAgo(15),
      },
      {
        id: 'h4', title: 'Tomar Creatina', description: '5g de creatina com água', emoji: '💊',
        category: 'nutrition', frequency: 'daily', targetCount: 1, points: 5,
        priority: 'medium', assignedTo: ['u2'], active: true, createdAt: daysAgo(10),
      },
      {
        id: 'h5', title: 'Meditação', description: '10 minutos de meditação', emoji: '🧘',
        category: 'mindfulness', frequency: 'daily', targetCount: 1, points: 12,
        priority: 'medium', assignedTo: ['u1', 'u2'], active: true, createdAt: daysAgo(18),
      },
      {
        id: 'h6', title: 'Leitura', description: 'Ler pelo menos 20 páginas', emoji: '📚',
        category: 'learning', frequency: 'daily', targetCount: 1, points: 15,
        priority: 'low', assignedTo: ['u1', 'u2'], active: true, createdAt: daysAgo(12),
      },
    ],
    habitLogs: [
      // Last 7 days - Ivanna
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `log_h1_u1_${i}`, habitId: 'h1', userId: 'u1',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T08:00:00Z`,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `log_h2_u1_${i}`, habitId: 'h2', userId: 'u1',
        date: daysAgo(i + 1), completedCount: 1, completedAt: `${daysAgo(i + 1)}T07:30:00Z`,
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `log_h3_u1_${i}`, habitId: 'h3', userId: 'u1',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T21:00:00Z`,
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `log_h5_u1_${i}`, habitId: 'h5', userId: 'u1',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T06:30:00Z`,
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `log_h6_u1_${i}`, habitId: 'h6', userId: 'u1',
        date: daysAgo(i + 1), completedCount: 1, completedAt: `${daysAgo(i + 1)}T22:00:00Z`,
      })),
      // Last 7 days - Tiago
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `log_h1_u2_${i}`, habitId: 'h1', userId: 'u2',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T09:00:00Z`,
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `log_h2_u2_${i}`, habitId: 'h2', userId: 'u2',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T07:00:00Z`,
      })),
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `log_h4_u2_${i}`, habitId: 'h4', userId: 'u2',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T08:00:00Z`,
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `log_h5_u2_${i}`, habitId: 'h5', userId: 'u2',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T06:00:00Z`,
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `log_h6_u2_${i}`, habitId: 'h6', userId: 'u2',
        date: daysAgo(i), completedCount: 1, completedAt: `${daysAgo(i)}T22:00:00Z`,
      })),
    ],
    tasks: [
      {
        id: 't1', title: 'Fazer compras da semana', emoji: '🛒',
        category: 'other', frequency: 'weekly', points: 15,
        priority: 'high', assignedTo: ['u1', 'u2'],
        completed: false, createdAt: daysAgo(3),
      },
      {
        id: 't2', title: 'Pagar contas do mês', emoji: '💳',
        category: 'finance', frequency: 'monthly', points: 20,
        priority: 'high', assignedTo: ['u2'],
        completed: true, completedBy: 'u2', completedAt: `${daysAgo(1)}T14:00:00Z`, createdAt: daysAgo(5),
      },
      {
        id: 't3', title: 'Ligar para família', emoji: '📞',
        category: 'social', frequency: 'weekly', points: 10,
        priority: 'medium', assignedTo: ['u1'],
        completed: true, completedBy: 'u1', completedAt: `${today}T10:00:00Z`, createdAt: daysAgo(7),
      },
      {
        id: 't4', title: 'Organizar armário', emoji: '🗄️',
        category: 'other', frequency: 'monthly', points: 25,
        priority: 'low', assignedTo: ['u1', 'u2'],
        completed: false, createdAt: daysAgo(2),
      },
      {
        id: 't5', title: 'Revisar metas mensais', emoji: '🎯',
        category: 'productivity', frequency: 'monthly', points: 30,
        priority: 'high', assignedTo: ['u1', 'u2'],
        completed: false, createdAt: daysAgo(1),
      },
    ],
    badges: BADGES,
    settings: {
      notificationsEnabled: true,
      weekStartsOn: 1,
      showCompletedTasks: true,
      competitionMode: true,
    },
  };
}

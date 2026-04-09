import type { AppState } from '../types';

export function createSeedState(): AppState {
  return {
    users: [
      {
        id: 'u1',
        name: 'Jogador 1',
        avatar: '👩',
        color: 'secondary',
        level: 1,
        xp: 0,
        totalPoints: 0,
        streak: 0,
        longestStreak: 0,
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'u2',
        name: 'Jogador 2',
        avatar: '👨',
        color: 'primary',
        level: 1,
        xp: 0,
        totalPoints: 0,
        streak: 0,
        longestStreak: 0,
        joinedAt: new Date().toISOString(),
      },
    ],
    activeUserId: 'u1',
    habits: [],
    habitLogs: [],
    tasks: [],
    badges: [
      { id: 'b1', name: 'Primeira Conquista', description: 'Complete sua primeira tarefa', emoji: '🌟', condition: 'tasks_1', earnedBy: [] },
      { id: 'b2', name: 'Semana Perfeita',     description: 'Complete todos os hábitos por 7 dias seguidos', emoji: '🔥', condition: 'streak_7', earnedBy: [] },
      { id: 'b3', name: 'Madrugador',          description: 'Complete uma tarefa antes das 8h', emoji: '🌅', condition: 'early_bird', earnedBy: [] },
      { id: 'b4', name: 'Hidratado',           description: 'Beba água por 30 dias consecutivos', emoji: '💧', condition: 'water_30', earnedBy: [] },
      { id: 'b5', name: 'Atleta',              description: 'Faça exercícios por 14 dias', emoji: '💪', condition: 'exercise_14', earnedBy: [] },
      { id: 'b6', name: 'Mestre da Rotina',    description: 'Acumule 1000 pontos totais', emoji: '👑', condition: 'points_1000', earnedBy: [] },
      { id: 'b7', name: 'Duo Imbatível',       description: 'Ambos completem todos os hábitos no mesmo dia', emoji: '❤️‍🔥', condition: 'duo_perfect_day', earnedBy: [] },
      { id: 'b8', name: 'Consistente',         description: 'Complete hábitos por 30 dias', emoji: '🏅', condition: 'streak_30', earnedBy: [] },
    ],
    settings: {
      notificationsEnabled: true,
      weekStartsOn: 1,
      showCompletedTasks: true,
      competitionMode: true,
    },
  };
}

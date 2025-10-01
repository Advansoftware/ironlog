/**
 * @fileOverview Lógica de gamificação, incluindo sistema de níveis e cálculo de XP.
 */

import type { ExercicioRegistrado } from './types';

// Cada 10kg de volume = 1 XP
const XP_PER_VOLUME = 0.1;

export const levelThresholds: Record<number, number> = {
  1: 0,
  2: 1000,
  3: 2500,
  4: 5000,
  5: 10000,
  6: 20000,
  7: 40000,
  8: 80000,
  9: 150000,
  10: 300000,
};

export const levelNames: Record<number, string> = {
  1: 'Frango em Crescimento',
  2: 'Tá Saindo da Jaula',
  3: 'Muleque Zica',
  4: 'Corpo em Construção',
  5: 'Vem Monstro!',
  6: 'Fábrica de Monstros',
  7: 'Monstrão',
8: 'BIIIRL!',
  9: 'Aberração da Maromba',
  10: 'Lenda da Maromba',
};

/**
 * Calcula o XP ganho em uma sessão de treino com base no volume.
 * @param exercicios - A lista de exercícios registrados na sessão.
 * @returns O total de XP ganho.
 */
export function calculateXP(exercicios: ExercicioRegistrado[]): number {
  const totalVolume = exercicios.reduce((sessionVolume, exercicio) => {
    const exerciseVolume = exercicio.series.reduce((exerciseTotal, set) => {
      return exerciseTotal + (set.peso * set.reps);
    }, 0);
    return sessionVolume + exerciseVolume;
  }, 0);

  return Math.floor(totalVolume * XP_PER_VOLUME);
}

/**
 * Verifica se o usuário subiu de nível.
 * @param oldXp - XP total antes da sessão.
 * @param newXp - XP total após a sessão.
 * @returns Um objeto contendo se houve level up e qual o novo nível.
 */
export function checkForLevelUp(oldXp: number, newXp: number): { didLevelUp: boolean; newLevel: number } {
  let oldLevel = 1;
  let newLevel = 1;

  for (const level in levelThresholds) {
    if (oldXp >= levelThresholds[level]) {
      oldLevel = parseInt(level, 10);
    }
    if (newXp >= levelThresholds[level]) {
      newLevel = parseInt(level, 10);
    }
  }

  return {
    didLevelUp: newLevel > oldLevel,
    newLevel: newLevel,
  };
}

/**
 * Calcula o progresso de XP para o nível atual.
 * @param totalXp - O XP total do usuário.
 * @returns Progresso em porcentagem, XP para o próximo nível e XP do nível atual.
 */
export function getLevelProgress(totalXp: number): { progressPercentage: number; xpToNextLevel: number; currentLevelXp: number, currentLevel: number } {
  let currentLevel = 1;
  for (const level in levelThresholds) {
    if (totalXp >= levelThresholds[level]) {
      currentLevel = parseInt(level, 10);
    }
  }

  const currentLevelXpThreshold = levelThresholds[currentLevel];
  const nextLevelXpThreshold = levelThresholds[currentLevel + 1] || totalXp;

  if (currentLevelXpThreshold === nextLevelXpThreshold) {
      return {
          progressPercentage: 100,
          xpToNextLevel: 0,
          currentLevelXp: totalXp - currentLevelXpThreshold,
          currentLevel,
      }
  }
  
  const xpInCurrentLevel = totalXp - currentLevelXpThreshold;
  const xpForNextLevel = nextLevelXpThreshold - currentLevelXpThreshold;

  const progressPercentage = Math.min(100, Math.floor((xpInCurrentLevel / xpForNextLevel) * 100));

  return {
    progressPercentage,
    xpToNextLevel: nextLevelXpThreshold - totalXp,
    currentLevelXp: xpInCurrentLevel,
    currentLevel,
  };
}

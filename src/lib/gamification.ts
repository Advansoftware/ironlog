
/**
 * @fileOverview Lógica de gamificação, incluindo sistema de níveis e cálculo de XP.
 * Este arquivo define as regras para a progressão do usuário, como os pontos de experiência (XP)
 * são calculados com base no volume de treino e como os níveis são atribuídos.
 */

import type { ExercicioRegistrado } from './types';
import { Icons } from '@/components/icons';
import type { LucideProps } from 'lucide-react';
import type { FunctionComponent } from 'react';

// Cada 10kg de volume total levantado em uma sessão equivale a 1 ponto de XP.
// Volume é calculado como: (peso * repetições) para cada série.
const XP_PER_VOLUME = 0.1;

/**
 * Define a quantidade de XP necessário para alcançar cada nível.
 */
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

/**
 * Define os metadados para cada nível, incluindo nome, ícone e cor do tema.
 * As cores são em formato HSL (Hue, Saturation, Lightness) para serem usadas como variáveis CSS.
 */
export const levelData: Record<number, { name: string; Icon: FunctionComponent<LucideProps>, color: string }> = {
  1: { name: 'Frango em Crescimento', Icon: Icons.Level1, color: '48 96% 58%' }, // Amarelo
  2: { name: 'Tá Saindo da Jaula', Icon: Icons.Level2, color: '24 96% 58%' }, // Laranja
  3: { name: 'Muleque Zica', Icon: Icons.Level3, color: '200 90% 55%' }, // Azul claro
  4: { name: 'Corpo em Construção', Icon: Icons.Level4, color: '260 80% 60%' }, // Roxo
  5: { name: 'Vem Monstro!', Icon: Icons.Level5, color: '0 84% 60%' }, // Vermelho
  6: { name: 'Fábrica de Monstros', Icon: Icons.Level6, color: '217 91% 60%'}, // Azul Escuro
  7: { name: 'Monstrão', Icon: Icons.Level7, color: '300 80% 60%' }, // Magenta
  8: { name: 'BIIIRL!', Icon: Icons.Level8, color: '100 80% 45%' }, // Verde Escuro
  9: { name: 'Aberração da Maromba', Icon: Icons.Level9, color: '0 0% 80%'}, // Prata
  10: { name: 'Lenda da Maromba', Icon: Icons.Level10, color: '130 100% 50%'}, // Verde IronLog original
};

/**
 * Calcula o XP ganho em uma sessão de treino com base no volume total.
 * @param exercicios - A lista de exercícios registrados na sessão.
 * @returns O total de XP ganho, arredondado para o número inteiro mais próximo.
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
 * Compara o XP antigo e o novo para determinar se o usuário subiu de nível.
 * @param oldXp - XP total antes da sessão.
 * @param newXp - XP total após a sessão.
 * @returns Um objeto indicando se houve level up e qual o novo nível alcançado.
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
 * Calcula o progresso de XP do usuário em relação ao seu nível atual e o próximo.
 * @param totalXp - O XP total do usuário.
 * @returns Um objeto com o progresso em porcentagem, XP restante para o próximo nível,
 * o XP acumulado desde o início do nível atual, e o número do nível atual.
 */
export function getLevelProgress(totalXp: number): { progressPercentage: number; xpToNextLevel: number; currentLevelXp: number, currentLevel: number } {
  let currentLevel = 1;
  const maxLevel = Math.max(...Object.keys(levelThresholds).map(Number));

  for (const level in levelThresholds) {
    if (totalXp >= levelThresholds[level]) {
      currentLevel = parseInt(level, 10);
    }
  }

  const currentLevelXpThreshold = levelThresholds[currentLevel];
  // Se o nível atual for o máximo, o próximo threshold é o próprio XP total
  const nextLevelXpThreshold = levelThresholds[currentLevel + 1] ?? levelThresholds[maxLevel];

  // Se estiver no nível máximo e o threshold para o próximo não existir
  if (currentLevel === maxLevel && !levelThresholds[currentLevel + 1]) {
      const xpInCurrentLevel = totalXp - currentLevelXpThreshold;
      return {
          progressPercentage: 100,
          xpToNextLevel: 0, // Não há próximo nível
          currentLevelXp: xpInCurrentLevel,
          currentLevel,
      }
  }
  
  const xpInCurrentLevel = totalXp - currentLevelXpThreshold;
  const xpForNextLevel = nextLevelXpThreshold - currentLevelXpThreshold;

  const progressPercentage = xpForNextLevel > 0 
    ? Math.min(100, Math.floor((xpInCurrentLevel / xpForNextLevel) * 100))
    : 100;

  return {
    progressPercentage,
    xpToNextLevel: xpForNextLevel > 0 ? nextLevelXpThreshold - totalXp : 0,
    currentLevelXp: xpInCurrentLevel,
    currentLevel,
  };
}

    
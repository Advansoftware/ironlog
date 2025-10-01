
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { SessaoDeTreino, RecordePessoal, Gamification, UnlockedAchievement } from '@/lib/types';
import { getHistorico, getRecordesPessoais, getGamification, getUnlockedAchievements } from '@/lib/storage';
import { generateDailyTip } from '@/ai/flows/generate-daily-tip';
import { levelData as allLevelData, getLevelProgress } from '@/lib/gamification';
import { isThisMonth, parseISO } from 'date-fns';

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [historico, setHistorico] = useState<SessaoDeTreino[]>([]);
  const [recordes, setRecordes] = useState<RecordePessoal[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(true);
  const [showEvolutionCard, setShowEvolutionCard] = useState(false);

  useEffect(() => {
    function loadData() {
      const allHistorico = getHistorico();
      const allRecordes = getRecordesPessoais();
      const currentGamification = getGamification();
      const allAchievements = getUnlockedAchievements();

      setHistorico(allHistorico);
      setRecordes(allRecordes);
      setGamification(currentGamification);
      setUnlockedAchievements(allAchievements);
      setIsLoading(false);

      const justLeveledUp = sessionStorage.getItem('justLeveledUp');
      if (justLeveledUp && navigator.onLine) {
        setShowEvolutionCard(true);
        sessionStorage.removeItem('justLeveledUp');
      }
    }
    
    loadData();
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, []);
  
  useEffect(() => {
    async function fetchTip() {
      setIsLoadingTip(true);
      try {
        const cachedTip = sessionStorage.getItem('dailyTip');
        const cacheDate = sessionStorage.getItem('dailyTipDate');
        const today = new Date().toDateString();

        if (cachedTip && cacheDate === today) {
          setDailyTip(cachedTip);
        } else if (navigator.onLine) {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const recentHistory = getHistorico().filter(s => new Date(s.data) > oneMonthAgo);
          
          if (recentHistory.length > 0) {
            const result = await generateDailyTip({ workoutHistory: JSON.stringify(recentHistory) });
            setDailyTip(result.tip);
            sessionStorage.setItem('dailyTip', result.tip);
            sessionStorage.setItem('dailyTipDate', today);
          } else {
             setDailyTip("Registre seu primeiro treino para começar a receber dicas personalizadas!");
          }
        } else if (cachedTip) {
           setDailyTip(cachedTip);
        } else {
           setDailyTip("Conecte-se à internet para receber sua primeira dica do dia personalizada!");
        }
      } catch (error) {
        console.error("Failed to fetch daily tip:", error);
        setDailyTip("Consistência é mais importante que intensidade no início. Focar em aprender a forma correta dos exercícios previne lesões e garante um progresso sólido.");
      } finally {
        setIsLoadingTip(false);
      }
    }

    if (!isLoading) {
      fetchTip();
    }
  }, [isLoading]);

  const stats = useMemo(() => ({
    totalWorkouts: historico.length,
    workoutsThisMonth: historico.filter(s => isThisMonth(parseISO(s.data))).length,
    totalPrs: recordes.length,
    totalAchievements: unlockedAchievements.length,
  }), [historico, recordes, unlockedAchievements]);

  const levelProgress = useMemo(() => (
    gamification ? getLevelProgress(gamification.xp) : { progressPercentage: 0, xpToNextLevel: 0, currentLevelXp: 0 }
  ), [gamification]);
  
  const currentLevel = gamification?.level ?? 1;
  const levelData = allLevelData[currentLevel] || allLevelData[1];
  
  const recentHistory = useMemo(() => historico.slice(0, 3), [historico]);

  return {
    isLoading,
    gamification,
    levelData,
    levelProgress,
    stats,
    dailyTip,
    isLoadingTip,
    showEvolutionCard,
    recentHistory
  };
}

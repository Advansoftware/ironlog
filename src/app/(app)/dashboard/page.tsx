'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Icons } from '@/components/icons';
import { getHistorico, getRecordesPessoais, getGamification } from '@/lib/storage';
import { format, parseISO, isThisMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import type { SessaoDeTreino, RecordePessoal, Gamification } from '@/lib/types';
import { Lightbulb, Loader2 } from 'lucide-react';
import { generateDailyTip } from '@/ai/flows/generate-daily-tip';
import { Progress } from '@/components/ui/progress';
import { levelData, getLevelProgress } from '@/lib/gamification';


export default function DashboardPage() {
  const [historico, setHistorico] = useState<SessaoDeTreino[]>([]);
  const [recordes, setRecordes] = useState<RecordePessoal[]>([]);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(true);
  const [gamification, setGamification] = useState<Gamification | null>(null);

  useEffect(() => {
    const allHistorico = getHistorico();
    setHistorico(allHistorico);
    setRecordes(getRecordesPessoais());
    setGamification(getGamification());
    
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
          const recentHistory = allHistorico.filter(s => new Date(s.data) > oneMonthAgo);
          
          const result = await generateDailyTip({ workoutHistory: JSON.stringify(recentHistory) });
          setDailyTip(result.tip);
          sessionStorage.setItem('dailyTip', result.tip);
          sessionStorage.setItem('dailyTipDate', today);
        } else if (cachedTip) {
           setDailyTip(cachedTip); // Use cached tip if offline
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

    fetchTip();
  }, []);

  const totalWorkouts = historico.length;
  const workoutsThisMonth = historico.filter(s => isThisMonth(parseISO(s.data))).length;
  const totalPrs = recordes.length;
  
  const { progressPercentage, xpToNextLevel, currentLevelXp } = gamification ? getLevelProgress(gamification.xp) : { progressPercentage: 0, xpToNextLevel: 0, currentLevelXp: 0 };
  const currentLevel = gamification?.level ?? 1;
  const { name: currentLevelName, Icon: LevelIcon } = levelData[currentLevel] || levelData[1];

  return (
    <>
      <PageHeader title="Painel" description="Bem-vindo de volta! Aqui está um resumo do seu progresso.">
        <Button asChild className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg">
          <Link href="/session">
            <Icons.Zap />
            Iniciar Treino Rápido
          </Link>
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/50 col-span-1 md:col-span-2 lg:col-span-3">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <LevelIcon className="size-6 text-primary" />
                Nível {currentLevel}: {currentLevelName}
            </CardTitle>
             {gamification !== null && (
                <CardDescription>
                    XP Total: {gamification.xp.toLocaleString('pt-BR')}
                </CardDescription>
            )}
          </CardHeader>
          {gamification !== null ? (
            <CardContent>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>{currentLevelXp.toLocaleString('pt-BR')} XP</span>
                  <span>{xpToNextLevel > 0 ? `${xpToNextLevel.toLocaleString('pt-BR')} XP para o próximo nível` : 'Nível Máximo!'}</span>
              </div>
            </CardContent>
          ) : (
            <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Carregando seu progresso...</span>
                </div>
            </CardContent>
          )}
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total de Treinos</span>
              <Icons.Flame className="size-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">sessões completas</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Treinos este Mês</span>
              <Icons.History className="size-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-4xl font-bold">{workoutsThisMonth}</p>
             <p className="text-xs text-muted-foreground">no mês atual</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recordes Batidos</span>
              <Icons.Star className="size-5 text-yellow-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-4xl font-bold">{totalPrs}</p>
             <p className="text-xs text-muted-foreground">recordes pessoais totais</p>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8 bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-yellow-400" />
                Dica do Dia
            </CardTitle>
        </CardHeader>
        <CardContent>
            {isLoadingTip ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Analisando seu progresso para gerar uma nova dica...</span>
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {dailyTip}
              </p>
            )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Histórico Recente</h2>
        <Card>
            <CardContent className="p-0">
                 <div className="divide-y divide-border">
                    {historico.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">
                        Você ainda não registrou nenhum treino.
                      </div>
                    )}
                    {historico.slice(0, 3).map((session) => (
                        <div key={session.id} className="p-4 flex justify-between items-center hover:bg-secondary/50 transition-colors">
                            <div>
                                <p className="font-semibold">{session.nome}</p>
                                <p className="text-sm text-muted-foreground">{session.exercicios.length} exercícios &bull; +{session.xpGanho} XP</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{format(parseISO(session.data), 'd MMM, yyyy', { locale: ptBR })}</p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}


'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Icons } from '@/components/icons';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardSkeleton } from '@/app/(app)/dashboard/dashboard-skeleton';
import { LevelProgress } from '@/app/(app)/dashboard/level-progress';
import { StatCard } from '@/app/(app)/dashboard/stat-card';
import { DailyTip } from '@/app/(app)/dashboard/daily-tip';
import { RecentHistory } from '@/app/(app)/dashboard/recent-history';
import { EvolutionCard } from '@/app/(app)/dashboard/evolution-card';

export default function DashboardPage() {
  const {
    isLoading,
    gamification,
    levelData,
    levelProgress,
    stats,
    dailyTip,
    isLoadingTip,
    showEvolutionCard,
    recentHistory,
  } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

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
      
      {showEvolutionCard && <EvolutionCard />}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {gamification && levelData && (
            <LevelProgress 
                gamification={gamification} 
                levelData={levelData} 
                levelProgress={levelProgress}
            />
        )}

        <StatCard 
            title="Total de Treinos"
            value={stats.totalWorkouts}
            description="sessões completas"
            Icon={Icons.Flame}
        />
        
        <StatCard 
            title="Treinos este Mês"
            value={stats.workoutsThisMonth}
            description="no mês atual"
            Icon={Icons.History}
        />

        <StatCard 
            title="Recordes Batidos"
            value={stats.totalPrs}
            description="recordes pessoais totais"
            Icon={Icons.Star}
            iconClassName="text-yellow-400"
        />

        <StatCard
          title="Conquistas"
          value={stats.totalAchievements}
          description="medalhas desbloqueadas"
          Icon={Icons.Award}
          iconClassName="text-orange-400"
        />
      </div>

      <DailyTip
        tip={dailyTip}
        isLoading={isLoadingTip}
      />
      
      <RecentHistory
        history={recentHistory}
      />
    </>
  );
}

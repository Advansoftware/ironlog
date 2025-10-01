
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getGamification, getHistorico, getRecordesPessoais, getUnlockedAchievements } from '@/lib/storage';
import { levelData, levelThresholds, getLevelProgress, allAchievements } from '@/lib/gamification';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Lock, Award, BarChart3, Star, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Gamification, UnlockedAchievement } from '@/lib/types';
import * as Lucide from 'lucide-react';


function StatCard({ Icon, value, label }: { Icon: React.ElementType, value: number | string, label: string }) {
    return (
        <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-4">
                <Icon className="size-8 text-primary" />
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function LevelsPage() {
    const [gamification, setGamification] = useState<Gamification>({ xp: 0, level: 1 });
    const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
    const [totalWorkouts, setTotalWorkouts] = useState(0);
    const [totalPrs, setTotalPrs] = useState(0);

    useEffect(() => {
        setGamification(getGamification());
        setUnlockedAchievements(getUnlockedAchievements());
        setTotalWorkouts(getHistorico().length);
        setTotalPrs(getRecordesPessoais().length);
    }, []);

    const { progressPercentage, xpToNextLevel } = getLevelProgress(gamification.xp);
    const sortedLevels = Object.entries(levelThresholds).sort(([, a], [, b]) => a - b);
    const currentLevelInfo = levelData[gamification.level] || levelData[1];

    const unlockedAchievementIds = new Set(unlockedAchievements.map(a => a.id));
    
    // Mapeia o nome do ícone para o componente Lucide real
    const getIconComponent = (iconName: string) => {
        const IconComponent = (Lucide as any)[iconName];
        return IconComponent || Award; // Retorna um ícone padrão se não encontrar
    };

    return (
        <TooltipProvider>
            <PageHeader
                title="BIIIRL!"
                description="É hora do show! Veja sua evolução e o caminho pra se tornar uma lenda."
            />

            <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-4">
                <StatCard Icon={BarChart3} value={gamification.xp.toLocaleString('pt-BR')} label="XP Total" />
                <StatCard Icon={Icons.Flame} value={totalWorkouts} label="Treinos Concluídos" />
                <StatCard Icon={Star} value={totalPrs} label="Recordes Batidos" />
                <StatCard Icon={Award} value={unlockedAchievements.length} label="Conquistas" />
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <currentLevelInfo.Icon className="text-primary size-7" />
                        Nível Atual: {currentLevelInfo.name}
                    </CardTitle>
                    <CardDescription>
                        XP Total: {gamification.xp.toLocaleString('pt-BR')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={progressPercentage} className="h-4" />
                     <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>Progresso do Nível</span>
                        <span className="font-semibold">
                            {xpToNextLevel > 0 ? `${xpToNextLevel.toLocaleString('pt-BR')} XP para o próximo nível` : 'Nível Máximo!'}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Seção de Conquistas */}
            <div className="mb-8">
                 <h2 className="text-2xl font-bold mb-4">Conquistas</h2>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {allAchievements.map(ach => {
                        const isUnlocked = unlockedAchievementIds.has(ach.id);
                        const Icon = getIconComponent(ach.icon);

                        return (
                            <Tooltip key={ach.id}>
                                <TooltipTrigger asChild>
                                    <Card className={cn(
                                        "transition-all text-center p-4 flex flex-col items-center justify-center gap-2",
                                        isUnlocked ? "border-primary/50 bg-primary/10" : "bg-card/50"
                                    )}>
                                        <div className="relative">
                                            <Icon className={cn("size-10", isUnlocked ? "text-primary" : "text-muted-foreground/50")} />
                                            {isUnlocked && <CheckCircle2 className="absolute -bottom-1 -right-1 size-5 text-green-400 bg-background rounded-full" />}
                                        </div>
                                        <p className={cn("font-semibold text-sm", !isUnlocked && "text-muted-foreground/80")}>
                                            {ach.name}
                                        </p>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{ach.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                 </div>
            </div>


            {/* Seção de Níveis */}
             <div>
                <h2 className="text-2xl font-bold mb-4">Jornada de Níveis</h2>
                <div className="space-y-4">
                    {sortedLevels.map(([levelStr, xpRequired]) => {
                        const levelNumber = parseInt(levelStr, 10);
                        const { name, Icon } = levelData[levelNumber];
                        const isUnlocked = gamification.level >= levelNumber;

                        return (
                            <Card 
                                key={levelNumber} 
                                className={cn(
                                    "transition-all", 
                                    isUnlocked ? "border-primary/50 bg-secondary/30" : "bg-card/50",
                                )}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                         <div className={cn("relative flex items-center justify-center size-12 rounded-full", isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                            <Icon className={cn("size-7", !isUnlocked && "opacity-30")} />
                                            {!isUnlocked && <Lock className="absolute size-5" />}
                                        </div>
                                        <div>
                                            <h3 className={cn("font-bold text-lg", isUnlocked ? "text-primary" : "text-foreground")}>
                                                Nível {levelNumber}: {name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Requer {xpRequired.toLocaleString('pt-BR')} XP
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
}

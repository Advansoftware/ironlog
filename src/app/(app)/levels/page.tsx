
'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getGamification } from '@/lib/storage';
import { levelData, levelThresholds, getLevelProgress } from '@/lib/gamification';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function LevelsPage() {
    const [gamification, setGamification] = useState({ xp: 0, level: 1 });

    useEffect(() => {
        setGamification(getGamification());
    }, []);

    const { progressPercentage, xpToNextLevel } = getLevelProgress(gamification.xp);
    const sortedLevels = Object.entries(levelThresholds).sort(([, a], [, b]) => a - b);
    const currentLevelInfo = levelData[gamification.level] || levelData[1];

    return (
        <>
            <PageHeader
                title="BIIIRL!"
                description="É hora do show! Veja sua evolução e o caminho pra se tornar uma lenda."
            />

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
        </>
    );
}

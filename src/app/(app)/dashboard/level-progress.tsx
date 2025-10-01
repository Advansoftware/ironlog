
import type { Gamification } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { FunctionComponent } from 'react';

interface LevelProgressProps {
    gamification: Gamification;
    levelData: { name: string; Icon: FunctionComponent<LucideProps> };
    levelProgress: { progressPercentage: number; xpToNextLevel: number; currentLevelXp: number; };
}

export function LevelProgress({ gamification, levelData, levelProgress }: LevelProgressProps) {
  const { name: currentLevelName, Icon: LevelIcon } = levelData;
  const { progressPercentage, xpToNextLevel, currentLevelXp } = levelProgress;

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <LevelIcon className="size-6 text-primary" />
            Nível {gamification.level}: {currentLevelName}
        </CardTitle>
        <CardDescription>
            XP Total: {gamification.xp.toLocaleString('pt-BR')}
        </CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>{currentLevelXp.toLocaleString('pt-BR')} XP</span>
                <span>{xpToNextLevel > 0 ? `${xpToNextLevel.toLocaleString('pt-BR')} XP para o próximo nível` : 'Nível Máximo!'}</span>
            </div>
        </CardContent>
    </Card>
  );
}

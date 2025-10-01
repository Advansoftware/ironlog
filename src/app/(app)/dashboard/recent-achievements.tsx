
'use client';
import { Award, Medal } from 'lucide-react';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/lib/types';


interface RecentAchievementsProps {
  achievements: (Achievement | null)[];
  totalCount: number;
}

// Mapeia o nome do ícone para o componente Lucide real
const getIconComponent = (iconName: string) => {
    const IconComponent = (Lucide as any)[iconName];
    return IconComponent || Medal; // Retorna um ícone padrão se não encontrar
};

export function RecentAchievements({ achievements, totalCount }: RecentAchievementsProps) {
  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conquistas</span>
            <Award className="size-5 text-orange-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <p className="text-4xl font-bold">{totalCount}</p>
            <div className="flex-1 flex justify-start -space-x-2">
                {achievements.length > 0 ? (
                    achievements.map((ach, index) => {
                         if (!ach) return null;
                         const Icon = getIconComponent(ach.icon);
                        return (
                          <Tooltip key={ach.id}>
                            <TooltipTrigger>
                                <div className="z-10 flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-primary shadow-lg" style={{ zIndex: 3 - index }}>
                                    <Icon className="size-5" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{ach.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                    })
                ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma ainda</p>
                )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">medalhas desbloqueadas</p>
        </CardContent>
        <CardFooter className="p-2 pt-0">
             <Link href="/levels" className={cn(buttonVariants({ variant: 'ghost', size: 'sm'}), 'w-full')}>
                Ver Todas
            </Link>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

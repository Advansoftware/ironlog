
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { getBibliotecaDeExercicios, gruposMusculares } from '@/lib/storage';
import { Weight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Exercicio } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ExerciseSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function ExercisesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [biblioteca, setBiblioteca] = useState<Exercicio[]>([]);
  
  useEffect(() => {
    setIsLoading(true);
    setBiblioteca(getBibliotecaDeExercicios());
    setIsLoading(false);
  }, []);

  return (
    <>
      <PageHeader
        title="Biblioteca de Exercícios"
        description="Navegue pelos exercícios por grupo muscular."
      />

      <Tabs defaultValue={gruposMusculares[0]} className="w-full" orientation="vertical">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-6 mb-4 h-auto">
          {gruposMusculares.map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {gruposMusculares.map((group) => (
          <TabsContent key={group} value={group} className="mt-0 md:mt-2 md:ml-4">
            {isLoading ? <ExerciseSkeleton /> : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {biblioteca
                    .filter((ex) => ex.grupoMuscular === group)
                    .map((exercise) => (
                    <Card key={exercise.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">
                            {exercise.nome}
                        </CardTitle>
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-xs text-muted-foreground">
                            {exercise.grupoMuscular}
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

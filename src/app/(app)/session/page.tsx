'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getRotinas, getNomeExercicio } from '@/lib/storage';
import { Check, Dumbbell, X } from 'lucide-react';

function SessionContent() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get('routineId');
  
  const rotinas = getRotinas();
  const routine = rotinas.find(r => r.id === routineId) || rotinas[0];

  if (!routine) {
    return (
        <>
            <PageHeader title="Nenhuma Rotina Encontrada" description="Crie uma rotina para começar." />
            <div className="text-center text-muted-foreground">
                <p>Parece que você não tem nenhuma rotina de treino ainda.</p>
                <Button asChild className="mt-4">
                    <a href="/routines">Criar Rotina</a>
                </Button>
            </div>
        </>
    );
  }

  return (
    <>
      <PageHeader title={routine.nome} description="Registre sua sessão de treino.">
        <div className="flex gap-2 w-full">
            <Button variant="outline" className="w-1/2">
                <X className="mr-2 size-4" />
                Cancelar
            </Button>
            <Button className="w-1/2">
                <Check className="mr-2 size-4" />
                Finalizar
            </Button>
        </div>
      </PageHeader>
      
      <div className="space-y-6">
        {routine.exercicios.map((exercise) => {
            const exerciseInfo = getNomeExercicio(exercise.exercicioId);
            return (
                <Card key={exercise.exercicioId}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Dumbbell className="size-5 text-primary" />
                            {exerciseInfo}
                        </CardTitle>
                        <CardDescription>
                            Meta: {exercise.seriesAlvo} séries de {exercise.repeticoesAlvo} reps
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-4 text-xs text-muted-foreground font-medium">
                            <span className="invisible">Série</span>
                            <Label>Peso (kg)</Label>
                            <Label>Reps</Label>
                            <span className="invisible">Feito</span>
                        </div>
                        
                        {Array.from({ length: exercise.seriesAlvo }).map((_, i) => (
                            <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2 sm:gap-x-4">
                                <span className="font-bold text-lg text-foreground">{i + 1}</span>
                                <Input type="number" placeholder="kg" defaultValue={exercise.pesoAlvo} />
                                <Input type="number" placeholder="reps" defaultValue={exercise.repeticoesAlvo} />
                                <Checkbox />
                            </div>
                        ))}

                        <Button variant="secondary" className="w-full">
                            Adicionar Série
                        </Button>
                    </CardContent>
                </Card>
            )
        })}
      </div>
    </>
  );
}

export default function SessionPage() {
    return (
      <Suspense fallback={<div>Carregando...</div>}>
        <SessionContent />
      </Suspense>
    );
}

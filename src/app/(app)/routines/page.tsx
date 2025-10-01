'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Icons } from '@/components/icons';
import { getRotinas } from '@/lib/storage';
import { useEffect, useState } from 'react';
import type { RotinaDeTreino } from '@/lib/types';

export default function RoutinesPage() {
  const [rotinas, setRotinas] = useState<RotinaDeTreino[]>([]);

  useEffect(() => {
    setRotinas(getRotinas());
  }, []);

  return (
    <>
      <PageHeader title="Rotinas" description="Crie e gerencie suas rotinas de treino." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
        {rotinas.map((routine) => (
          <Card key={routine.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{routine.nome}</CardTitle>
              <CardDescription>{routine.exercicios.length} exercícios</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <Button asChild className="w-full">
                <Link href={`/session?routineId=${routine.id}`}>
                  <Icons.Zap />
                  Iniciar Treino
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {rotinas.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            Nenhuma rotina criada ainda.
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border md:hidden">
        <Button className="w-full" size="lg">
          <Icons.Add />
          Criar Rotina
        </Button>
      </div>
      <div className="hidden md:flex fixed bottom-8 right-8">
         <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
           <Icons.Add className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}

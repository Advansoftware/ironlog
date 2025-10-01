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
      <PageHeader title="Rotinas" description="Crie e gerencie suas rotinas de treino." >
        <div className="hidden md:flex">
          <Button>
            <Icons.Add />
            Criar Rotina
          </Button>
        </div>
      </PageHeader>

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

    </>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Icons } from '@/components/icons';
import { getHistorico, getRecordesPessoais, getNomeExercicio, getRotinas } from '@/lib/storage';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import type { SessaoDeTreino, RecordePessoal, RotinaDeTreino } from '@/lib/types';


export default function DashboardPage() {
  const [historico, setHistorico] = useState<SessaoDeTreino[]>([]);
  const [recordes, setRecordes] = useState<RecordePessoal[]>([]);
  const [rotinas, setRotinas] = useState<RotinaDeTreino[]>([]);

  useEffect(() => {
    setHistorico(getHistorico());
    setRecordes(getRecordesPessoais());
    setRotinas(getRotinas());
  }, []);

  const totalWorkouts = historico.length;
  const totalRoutines = rotinas.length;
  const latestPr = recordes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

  return (
    <>
      <PageHeader title="Painel" description="Aqui está um resumo do seu progresso.">
        <Button asChild>
          <Link href="/session">
            <Icons.Add />
            Iniciar Treino
          </Link>
        </Button>
      </PageHeader>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total de Treinos</span>
              <Icons.History className="size-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">sessões registradas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Rotinas Criadas</span>
              <Icons.Routines className="size-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalRoutines}</p>
            <p className="text-xs text-muted-foreground">rotinas criadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Último RP</span>
                <Icons.Progress className="size-5 text-muted-foreground" />
            </CardTitle>
            <CardDescription>
                {latestPr ? `em ${format(new Date(latestPr.data), 'd \'de\' MMMM', { locale: ptBR })}` : 'Nenhum recorde ainda'}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {latestPr ? (
                <>
                    <p className="text-3xl font-bold">{getNomeExercicio(latestPr.exercicioId)}</p>
                    <p className="text-lg text-muted-foreground">{latestPr.peso}kg por {latestPr.reps} reps</p>
                </>
            ) : (
                <p className="text-lg text-muted-foreground">Registre um treino para definir seu primeiro RP!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Treinos Recentes</h2>
        <Card>
            <CardContent className="p-0">
                 <div className="divide-y divide-border">
                    {historico.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">
                        Nenhum treino recente.
                      </div>
                    )}
                    {historico.slice(0, 3).map((session) => (
                        <div key={session.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{session.nome}</p>
                                <p className="text-sm text-muted-foreground">{session.exercicios.length} exercícios</p>
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

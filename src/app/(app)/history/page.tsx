'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { getHistorico, getNomeExercicio } from '@/lib/storage';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Dumbbell, Repeat, Weight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SessaoDeTreino } from '@/lib/types';

export default function HistoryPage() {
  const [historico, setHistorico] = useState<SessaoDeTreino[]>([]);

  useEffect(() => {
    setHistorico(getHistorico().sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
  }, []);

  return (
    <>
      <PageHeader
        title="Histórico de Treinos"
        description="Reveja suas sessões passadas e acompanhe a consistência."
      />
      <Card>
        <CardContent className="p-0">
          {historico.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum treino registrado ainda.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {historico.map((session) => (
                <AccordionItem value={session.id} key={session.id}>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left pr-4">
                      <span className="font-semibold text-lg">{session.nome}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{format(parseISO(session.data), 'd \'de\' MMMM, yyyy', { locale: ptBR })}</span>
                          <div className="flex items-center gap-1">
                              <Clock className="size-4" />
                              <span>{session.duracao} min</span>
                          </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-4">
                      {session.exercicios.map((exercise, index) => (
                        <div key={index}>
                          <h4 className="font-semibold text-md mb-2 flex items-center gap-2">
                            <Dumbbell className="size-4 text-primary" />
                            {getNomeExercicio(exercise.exercicioId)}
                          </h4>
                          <div className="space-y-1 pl-6">
                            {exercise.series.map((set, setIndex) => (
                              <div key={setIndex} className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="w-16">Série {setIndex + 1}</span>
                                <div className="flex items-center gap-1">
                                  <Repeat className="size-3"/>
                                  <span>{set.reps} reps</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Weight className="size-3"/>
                                  <span>{set.peso} kg</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </>
  );
}

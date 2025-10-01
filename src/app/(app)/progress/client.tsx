
"use client";

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateProgressVisualizations } from '@/ai/flows/generate-progress-visualizations';
import { getHistorico, getRecordesPessoais, getBibliotecaDeExercicios, getNomeExercicio } from '@/lib/storage';
import { Loader2, Sparkles } from 'lucide-react';
import type { SessaoDeTreino, RecordePessoal, Exercicio } from '@/lib/types';

const chartConfig = {
  weight: {
    label: "Peso (kg)",
    color: "hsl(var(--primary))",
  },
}

export function ProgressClient() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [historico, setHistorico] = useState<SessaoDeTreino[]>([]);
  const [recordes, setRecordes] = useState<RecordePessoal[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ex1'); // Default to Bench Press

  useEffect(() => {
    setHistorico(getHistorico());
    setRecordes(getRecordesPessoais());
    
    // Get only exercises that have been performed
    const performedExerciseIds = new Set(getHistorico().flatMap(s => s.exercicios.map(e => e.exercicioId)));
    setExercicios(getBibliotecaDeExercicios().filter(ex => performedExerciseIds.has(ex.id)));

  }, []);

  const exerciseHistory = historico
    .map(session => {
      const exercise = session.exercicios.find(ex => ex.exercicioId === selectedExerciseId);
      if (!exercise) return null;
      const topSet = exercise.series.reduce((max, set) => set.peso > max.peso ? set : max, { peso: 0, reps: 0, concluido: false });
      return {
        date: new Date(session.data).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        weight: topSet.peso,
      };
    })
    .filter(Boolean) as { date: string; weight: number }[];


  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setAiAnalysis(null);
    try {
      const workoutData = JSON.stringify(historico, null, 2);
      const prData = JSON.stringify(recordes, null, 2);
      
      const result = await generateProgressVisualizations({
        workoutData: workoutData,
        personalRecords: prData,
        workoutHistory: workoutData,
      });

      setAiAnalysis(result.progressVisualization);

    } catch (error) {
      console.error("Falha ao gerar análise de IA:", error);
      toast({
        variant: 'destructive',
        title: "Erro",
        description: "Falha ao gerar análise de IA. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedExerciseName = getNomeExercicio(selectedExerciseId);

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Progresso em {selectedExerciseName}</CardTitle>
                    <CardDescription>Peso máximo levantado ao longo do tempo.</CardDescription>
                  </div>
                  <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Selecione um exercício" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercicios.length > 0 ? (
                        exercicios.map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>{ex.nome}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Nenhum exercício registrado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
            </CardHeader>
            <CardContent>
              {exerciseHistory.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={exerciseHistory} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="kg" />
                            <Tooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="weight" fill="var(--color-weight)" radius={8} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  Nenhum dado de {selectedExerciseName.toLowerCase()} para exibir.
                </div>
              )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary size-5" />
                    <span>Análise com IA</span>
                </CardTitle>
                <CardDescription>
                    Receba feedback e sugestões personalizadas com base no seu histórico de treinos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <p className="text-muted-foreground">Gerando análise...</p>
                    </div>
                )}
                {aiAnalysis && (
                     <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap rounded-md border bg-secondary/30 p-4">
                        <p>{aiAnalysis}</p>
                     </div>
                )}
                {!isLoading && !aiAnalysis && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground">Clique no botão abaixo para gerar sua análise.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleGenerateAnalysis} disabled={isLoading || historico.length === 0}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gerando...
                        </>
                    ) : (
                       "Gerar Análise"
                    )}
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}

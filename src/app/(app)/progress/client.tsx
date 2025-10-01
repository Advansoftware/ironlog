"use client";

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateProgressVisualizations } from '@/ai/flows/generate-progress-visualizations';
import { getHistorico, getRecordesPessoais } from '@/lib/storage';
import { Loader2, Sparkles } from 'lucide-react';
import type { SessaoDeTreino, RecordePessoal } from '@/lib/types';

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

  useEffect(() => {
    setHistorico(getHistorico());
    setRecordes(getRecordesPessoais());
  }, []);

  const benchPressHistory = historico
    .map(session => {
      const benchExercise = session.exercicios.find(ex => ex.exercicioId === 'ex1');
      if (!benchExercise) return null;
      const topSet = benchExercise.series.reduce((max, set) => set.peso > max.peso ? set : max, { peso: 0, reps: 0, concluido: false });
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

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Progresso no Supino</CardTitle>
                <CardDescription>Peso máximo levantado ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent>
              {benchPressHistory.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={benchPressHistory} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
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
                  Nenhum dado de supino para exibir.
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

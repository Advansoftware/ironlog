
"use client";

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart } from 'recharts';
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
import { format, startOfWeek, parseISO } from 'date-fns';

const volumeChartConfig = {
  volume: {
    label: "Volume (kg)",
    color: "hsl(var(--primary))",
  },
}

const frequencyChartConfig = {
  workouts: {
    label: "Treinos",
    color: "hsl(var(--primary))",
  },
}

export function ProgressClient() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [historico, setHistorico] = useState<SessaoDeTreino[]>([]);
  const [recordes, setRecordes] = useState<RecordePessoal[]>([]);
  const [volumeData, setVolumeData] = useState<{date: string, volume: number}[]>([]);
  const [frequencyData, setFrequencyData] = useState<{week: string, workouts: number}[]>([]);
  
  useEffect(() => {
    const allHistorico = getHistorico();
    setHistorico(allHistorico);
    setRecordes(getRecordesPessoais());

    // Calculate total volume per session
    const volumePerSession = allHistorico.map(session => {
        const totalVolume = session.exercicios.reduce((sessionTotal, exercise) => {
            const exerciseVolume = exercise.series.reduce((exerciseTotal, set) => {
                return exerciseTotal + (set.peso * set.reps);
            }, 0);
            return sessionTotal + exerciseVolume;
        }, 0);

        return {
            date: new Date(session.data).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
            volume: totalVolume,
        };
    }).reverse();
    setVolumeData(volumePerSession);


    // Calculate workouts per week
    const workoutsByWeek: Record<string, number> = {};
    allHistorico.forEach(session => {
        const weekStart = startOfWeek(parseISO(session.data), { weekStartsOn: 1 });
        const weekKey = format(weekStart, 'dd/MM');
        if (!workoutsByWeek[weekKey]) {
            workoutsByWeek[weekKey] = 0;
        }
        workoutsByWeek[weekKey]++;
    });

    const weeklyFrequency = Object.entries(workoutsByWeek).map(([week, workouts]) => ({
        week,
        workouts,
    })).reverse();
    setFrequencyData(weeklyFrequency);


  }, []);

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
                <CardTitle>Volume Total por Sessão</CardTitle>
                <CardDescription>Volume total (peso x séries x reps) levantado em cada treino.</CardDescription>
            </CardHeader>
            <CardContent>
              {volumeData.length > 0 ? (
                <ChartContainer config={volumeChartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={volumeData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="kg" />
                            <Tooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="volume" fill="var(--color-volume)" radius={8} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  Nenhum treino registrado para exibir o volume.
                </div>
              )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Frequência Semanal</CardTitle>
                <CardDescription>Número de treinos concluídos por semana.</CardDescription>
            </CardHeader>
            <CardContent>
              {frequencyData.length > 0 ? (
                <ChartContainer config={frequencyChartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <LineChart data={frequencyData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                            <Tooltip content={<ChartTooltipContent hideIndicator />} />
                            <Legend />
                            <Line type="monotone" dataKey="workouts" stroke="var(--color-workouts)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  Nenhum treino registrado para exibir a frequência.
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

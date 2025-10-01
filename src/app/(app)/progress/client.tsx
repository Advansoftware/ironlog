"use client";

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateProgressVisualizations } from '@/ai/flows/generate-progress-visualizations';
import { history, personalRecords } from '@/lib/data';
import { Loader2, Sparkles } from 'lucide-react';

// Process data for charts
const benchPressHistory = history
  .map(session => {
    const benchExercise = session.exercises.find(ex => ex.exerciseId === 'ex1');
    if (!benchExercise) return null;
    const topSet = benchExercise.sets.reduce((max, set) => set.weight > max.weight ? set : max, { weight: 0, reps: 0, completed: false });
    return {
      date: new Date(session.date).toLocaleDate-string('en-US', { month: 'short', day: 'numeric' }),
      weight: topSet.weight,
    };
  })
  .filter(Boolean) as { date: string; weight: number }[];

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--primary))",
  },
}

export function ProgressClient() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setAiAnalysis(null);
    try {
      const workoutData = JSON.stringify(history, null, 2);
      const prData = JSON.stringify(personalRecords, null, 2);
      
      const result = await generateProgressVisualizations({
        workoutData: workoutData,
        personalRecords: prData,
        workoutHistory: workoutData,
      });

      setAiAnalysis(result.progressVisualization);

    } catch (error) {
      console.error("Failed to generate AI analysis:", error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to generate AI-powered analysis. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Bench Press Progress</CardTitle>
                <CardDescription>Max weight lifted over time.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary size-5" />
                    <span>AI-Powered Analysis</span>
                </CardTitle>
                <CardDescription>
                    Get personalized feedback and suggestions based on your workout history.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        <p className="text-muted-foreground">Generating analysis...</p>
                    </div>
                )}
                {aiAnalysis && (
                     <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap rounded-md border bg-secondary/30 p-4">
                        <p>{aiAnalysis}</p>
                     </div>
                )}
                {!isLoading && !aiAnalysis && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground">Click the button below to generate your analysis.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                       "Generate Analysis"
                    )}
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}

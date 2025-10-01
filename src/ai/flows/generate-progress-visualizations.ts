'use server';
/**
 * @fileOverview Generates visual representations of workout data to show progress over time and suggest incremental load increases.
 *
 * - generateProgressVisualizations - A function that generates visual representations of workout data.
 * - GenerateProgressVisualizationsInput - The input type for the generateProgressVisualizations function.
 * - GenerateProgressVisualizationsOutput - The return type for the generateProgressVisualizations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProgressVisualizationsInputSchema = z.object({
  workoutData: z.string().describe('Workout data in JSON format, including exercise name, sets, reps, weight, and date.'),
  personalRecords: z.string().describe('Personal records data in JSON format, including exercise name and record value.'),
  workoutHistory: z.string().describe('Workout history data in JSON format, including exercise name, date, sets, reps and weight.'),
});
export type GenerateProgressVisualizationsInput = z.infer<typeof GenerateProgressVisualizationsInputSchema>;

const GenerateProgressVisualizationsOutputSchema = z.object({
  progressVisualization: z.string().describe('A description of the progress visualization, including suggested incremental load increases.'),
});
export type GenerateProgressVisualizationsOutput = z.infer<typeof GenerateProgressVisualizationsOutputSchema>;

export async function generateProgressVisualizations(
  input: GenerateProgressVisualizationsInput
): Promise<GenerateProgressVisualizationsOutput> {
  return generateProgressVisualizationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProgressVisualizationsPrompt',
  input: {schema: GenerateProgressVisualizationsInputSchema},
  output: {schema: GenerateProgressVisualizationsOutputSchema},
  prompt: `You are an expert fitness coach. You will generate a visual representation and analysis of the user's workout data to show progress over time. Based on their personal records and workout history, you will also suggest incremental load increases.

Workout Data: {{{workoutData}}}
Personal Records: {{{personalRecords}}}
Workout History: {{{workoutHistory}}}`,
});

const generateProgressVisualizationsFlow = ai.defineFlow(
  {
    name: 'generateProgressVisualizationsFlow',
    inputSchema: GenerateProgressVisualizationsInputSchema,
    outputSchema: GenerateProgressVisualizationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

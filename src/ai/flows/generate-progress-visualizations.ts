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
  workoutData: z.string().describe('Dados de treino em formato JSON, incluindo nome do exercício, séries, repetições, peso e data.'),
  personalRecords: z.string().describe('Dados de recordes pessoais em formato JSON, incluindo nome do exercício e valor do recorde.'),
  workoutHistory: z.string().describe('Dados do histórico de treinos em formato JSON, incluindo nome do exercício, data, séries, repetições e peso.'),
});
export type GenerateProgressVisualizationsInput = z.infer<typeof GenerateProgressVisualizationsInputSchema>;

const GenerateProgressVisualizationsOutputSchema = z.object({
  progressVisualization: z.string().describe('Uma descrição da visualização do progresso, incluindo sugestões de aumentos incrementais de carga.'),
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
  prompt: `Você é um personal trainer especialista. Você irá gerar uma representação visual e análise dos dados de treino do usuário para mostrar o progresso ao longo do tempo. Com base em seus recordes pessoais e histórico de treinos, você também sugerirá aumentos incrementais de carga. A resposta deve ser em português do Brasil.

Dados de Treino: {{{workoutData}}}
Recordes Pessoais: {{{personalRecords}}}
Histórico de Treinos: {{{workoutHistory}}}`,
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

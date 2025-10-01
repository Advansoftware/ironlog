
'use server';
/**
 * @fileOverview Gera representações visuais de dados de treino para mostrar o progresso ao longo do tempo e sugerir aumentos incrementais de carga.
 * Este fluxo utiliza o histórico de treinos e recordes pessoais para fornecer uma análise textual do progresso do usuário.
 */

import {ai} from '@/ai/genkit';
import { GenerateProgressVisualizationsInputSchema, GenerateProgressVisualizationsOutputSchema, type GenerateProgressVisualizationsInput, type GenerateProgressVisualizationsOutput } from './types';

/**
 * Função de wrapper exportada que invoca o fluxo Genkit para gerar a análise de progresso.
 * @param input Os dados de entrada, incluindo dados de treino, recordes e histórico.
 * @returns Uma promessa que resolve para a análise textual gerada pela IA.
 */
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

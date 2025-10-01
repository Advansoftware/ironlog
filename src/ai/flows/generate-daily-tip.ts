'use server';
/**
 * @fileOverview Generates a daily, helpful tip for a gym user based on their recent workout history.
 */

import {ai} from '@/ai/genkit';
import { GenerateDailyTipInputSchema, GenerateDailyTipOutputSchema, type GenerateDailyTipInput, type GenerateDailyTipOutput } from './types';


export async function generateDailyTip(input: GenerateDailyTipInput): Promise<GenerateDailyTipOutput> {
  return generateDailyTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyTipPrompt',
  input: {schema: GenerateDailyTipInputSchema},
  output: {schema: GenerateDailyTipOutputSchema},
  prompt: `Você é um personal trainer de elite, especialista em analisar dados de treino para fornecer conselhos práticos e motivacionais. Seu cliente enviou o histórico de treinos do último mês.

Analise os dados a seguir para identificar padrões, pontos fortes, pontos fracos ou áreas para melhoria. Com base em sua análise, gere uma única dica curta, impactante e personalizada para o dia.

A dica deve ser relevante para o nível de experiência do usuário, que pode ser inferido pela frequência, volume e progressão de carga nos treinos. Se o usuário for iniciante, foque em fundamentos como forma e consistência. Se for avançado, ofereça dicas sobre como quebrar platôs, otimizar a recuperação ou variações de exercícios.

Histórico de Treinos:
{{{workoutHistory}}}

Sua resposta deve ser em português do Brasil, em um tom encorajador e direto.`,
});

const generateDailyTipFlow = ai.defineFlow(
  {
    name: 'generateDailyTipFlow',
    inputSchema: GenerateDailyTipInputSchema,
    outputSchema: GenerateDailyTipOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

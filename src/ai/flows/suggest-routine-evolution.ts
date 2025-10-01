
'use server';
/**
 * @fileOverview Sugere uma evolução na rotina de treino quando o usuário sobe de nível.
 * Este fluxo analisa o progresso recente do usuário para gerar uma sugestão motivacional
 * e inteligente para a próxima fase do treinamento, incentivando o usuário a iniciar uma conversa
 * com o personal trainer de IA.
 */

import { ai } from '@/ai/genkit';
import { SuggestRoutineEvolutionInputSchema, SuggestRoutineEvolutionOutputSchema, type SuggestRoutineEvolutionInput, type SuggestRoutineEvolutionOutput } from './types';

/**
 * Função de wrapper exportada que invoca o fluxo Genkit para sugerir uma evolução de rotina.
 * @param input Os dados de entrada, incluindo o novo nível do usuário e seu histórico.
 * @returns Uma promessa que resolve para a sugestão de texto gerada pela IA.
 */
export async function suggestRoutineEvolution(input: SuggestRoutineEvolutionInput): Promise<SuggestRoutineEvolutionOutput> {
  return suggestRoutineEvolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRoutineEvolutionPrompt',
  input: { schema: SuggestRoutineEvolutionInputSchema },
  output: { schema: SuggestRoutineEvolutionOutputSchema },
  prompt: `Você é um personal trainer de elite. Um de seus alunos acabou de subir para o nível {{newLevel}}. Isso é um marco importante!

Analise o histórico de treinos e os recordes pessoais do aluno para entender seu progresso, seus pontos fortes e onde ele pode estar estagnando.

Histórico de Treinos (últimos 30-60 dias):
{{{workoutHistory}}}

Recordes Pessoais:
{{{personalRecords}}}

Com base na sua análise e no novo nível alcançado, gere uma sugestão curta, motivadora e inteligente para a próxima fase do treinamento dele. A sugestão não deve ser uma rotina completa, mas sim uma proposta de foco ou mudança.

Exemplos de sugestão:
- "Parabéns por chegar ao Nível {{newLevel}}! Notei que seus exercícios de peito estão evoluindo rápido. Que tal focarmos em um ciclo de hipertrofia para ganhar mais volume nas próximas semanas?"
- "Uau, Nível {{newLevel}}! Sua consistência é incrível. Para quebrar qualquer platô, sugiro introduzirmos alguns exercícios compostos novos, como o Levantamento Terra. O que acha?"

Seja específico, use os dados fornecidos e termine com uma pergunta para engajar o usuário a criar uma nova rotina. A resposta deve ser em português do Brasil.`,
});

const suggestRoutineEvolutionFlow = ai.defineFlow(
  {
    name: 'suggestRoutineEvolutionFlow',
    inputSchema: SuggestRoutineEvolutionInputSchema,
    outputSchema: SuggestRoutineEvolutionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

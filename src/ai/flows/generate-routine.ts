
'use server';
/**
 * @fileOverview Gera uma rotina de treino personalizada com base nas especificações do usuário.
 * Este fluxo recebe os objetivos do usuário, nível de experiência, dias disponíveis e local de treino
 * para criar uma rotina de exercícios estruturada, utilizando uma lista de exercícios disponíveis.
 */

import { ai } from '@/ai/genkit';
import { GenerateRoutineInputSchema, GenerateRoutineOutputSchema, type GenerateRoutineInput, type GenerateRoutineOutput } from './types';

/**
 * Função de wrapper exportada que invoca o fluxo Genkit para gerar uma nova rotina.
 * @param input As especificações do usuário para a criação da rotina.
 * @returns Uma promessa que resolve para a rotina de treino gerada pela IA.
 */
export async function generateRoutine(input: GenerateRoutineInput): Promise<GenerateRoutineOutput> {
  return generateRoutineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoutinePrompt',
  input: { schema: GenerateRoutineInputSchema },
  output: { schema: GenerateRoutineOutputSchema },
  prompt: `Você é um personal trainer de elite e especialista em musculação. Sua tarefa é criar a melhor rotina de treino possível para um usuário, com base nas informações fornecidas. A resposta DEVE ser em formato JSON e aderir ao esquema de saída.

A rotina deve ser estruturada, eficaz e segura, adequada ao nível de experiência do usuário e aos equipamentos disponíveis.

Informações do Usuário:
- Objetivo Principal: {{{objetivo}}}
- Nível de Experiência: {{{nivelExperiencia}}}
- Dias por Semana: {{{diasPorSemana}}}
- Local de Treino/Equipamentos: {{{localDeTreino}}}
- Observações: {{{observacoes}}}

Exercícios Disponíveis (use apenas exercícios desta lista. A coluna 'equipamento' indica o necessário para cada um):
{{{exerciciosDisponiveis}}}

Instruções:
1.  Crie um nome para a rotina que seja motivador e descritivo.
2.  Selecione os melhores exercícios da lista fornecida que se alinhem com o objetivo do usuário e seu local de treino. Por exemplo, se o local for 'Casa', priorize exercícios com 'Peso do Corpo' e 'Halteres'. Se for 'Academia', use todos os tipos de equipamento.
3.  Distribua os exercícios de forma lógica ao longo dos dias de treino, se aplicável (embora o schema de saída seja uma lista única, você pode organizar a lógica do treino pensando na divisão semanal).
4.  Defina o número de séries e repetições (seriesAlvo, repeticoesAlvo) para cada exercício, de acordo com o objetivo (ex: menos reps para força, mais reps para hipertrofia/resistência).
5.  O 'exercicioId' no JSON de saída DEVE corresponder a um 'id' da lista de exercícios disponíveis.
6.  O 'nomeExercicio' no JSON de saída DEVE corresponder ao 'nome' do exercício correspondente.
7.  A resposta final deve ser um JSON válido que corresponda ao GenerateRoutineOutputSchema. Não adicione nenhum texto ou formatação fora do JSON.
`,
});

const generateRoutineFlow = ai.defineFlow(
  {
    name: 'generateRoutineFlow',
    inputSchema: GenerateRoutineInputSchema,
    outputSchema: GenerateRoutineOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

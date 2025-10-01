
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

**REGRAS OBRIGATÓRIAS PARA INICIANTES:**
- **Estrutura**: Divida por grupos musculares (ex: peito/tríceps, costas/bíceps, pernas)
- **Exercícios**: 4-6 exercícios por treino máximo. PRIORIZE exercícios compostos (supino, agachamento, remada, desenvolvimento)
- **Séries e Repetições**: 3 séries de 8-12 repetições para hipertrofia (ganho de massa)
- **Consistência**: Para iniciantes, prefira 2-3 dias/semana com qualidade

Instruções:
1.  Crie um nome para a rotina que seja motivador e descritivo.
2.  **SELEÇÃO DE EXERCÍCIOS**: Para iniciantes, SEMPRE priorize exercícios compostos da lista. Para intermediários/avançados, combine compostos + isolados. Adapte ao local de treino: 'Casa' = Peso do Corpo + Halteres, 'Academia' = todos os equipamentos.
3.  **ESTRUTURA DA ROTINA**: Se iniciante, organize por grupos musculares lógicos. Se avançado, pode usar divisões mais complexas.
4.  **SÉRIES E REPETIÇÕES**: Iniciante = 3 séries de 8-12 reps (hipertrofia), Intermediário = 3-4 séries de 6-15 reps, Avançado = 3-5 séries variadas conforme objetivo.
5.  **QUANTIDADE**: Iniciante máximo 6 exercícios, Intermediário 6-8, Avançado 8-12.
6.  O 'exercicioId' no JSON de saída DEVE corresponder a um 'id' da lista de exercícios disponíveis.
7.  O 'nomeExercicio' no JSON de saída DEVE corresponder ao 'nome' do exercício correspondente.
8.  A resposta final deve ser um JSON válido que corresponda ao GenerateRoutineOutputSchema. Não adicione nenhum texto ou formatação fora do JSON.
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

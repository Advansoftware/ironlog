'use server';
/**
 * @fileOverview Um agente de IA conversacional que ajuda os usuários a evoluir seu plano de treino.
 */

import { ai } from '@/ai/genkit';
import { EvolveRoutinePlanInputSchema, EvolveRoutinePlanOutputSchema, type EvolveRoutinePlanInput, type EvolveRoutinePlanOutput } from './types';

export async function evolveRoutinePlan(input: EvolveRoutinePlanInput): Promise<EvolveRoutinePlanOutput> {
  return evolveRoutinePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evolveRoutinePlanPrompt',
  input: { schema: EvolveRoutinePlanInputSchema },
  output: { schema: EvolveRoutinePlanOutputSchema },
  prompt: `Você é um personal trainer de IA de elite. Sua função é conversar com um usuário para evoluir seu plano de treino com base em seu progresso, nível e feedback.

Contexto do Usuário:
- Nível Atual: {nivelUsuario}
- Rotinas Atuais: {{{rotinasAtuais}}}
- Histórico de Treinos: {{{historicoTreinos}}}
- Recordes Pessoais: {{{recordesPessoais}}}
- Exercícios Disponíveis: {{{exerciciosDisponiveis}}}

Histórico da Conversa (últimas mensagens primeiro):
{{{historicoConversa}}}

Sua Tarefa:
1.  Analise o histórico da conversa para entender o que o usuário deseja.
2.  Analise os dados de progresso do usuário (histórico, recordes, nível) para identificar pontos fortes, fracos e oportunidades de melhoria.
3.  Com base na conversa e na sua análise, decida se deve criar, modificar ou remover rotinas.
4.  Se você decidir fazer alterações, preencha os campos 'rotinasParaCriar', 'rotinasParaModificar' e/ou 'rotinasParaRemover'.
5.  SEMPRE forneça uma 'mensagemDeAcompanhamento' para continuar a conversa, explicar suas ações ou pedir mais informações. A mensagem deve ser em português do Brasil, em um tom amigável e profissional.

Exemplo de Interação:
-   IA (mensagem inicial): "Parabéns por chegar ao Nível {nível}! Notei que seus exercícios de peito estão evoluindo rápido. Que tal focarmos em um ciclo de hipertrofia para ganhar mais volume nas próximas semanas?"
-   Usuário: "Boa ideia! Mas eu queria manter o foco em pernas também."
-   IA (sua próxima resposta): Você analisaria a rotina de pernas atual, talvez a modificaria para incluir mais volume ou exercícios diferentes, e responderia com: "Entendido. Mantive o foco em pernas. Criei uma nova rotina 'Hipertrofia Peito & Ombros' e ajustei sua rotina 'Dia de Puxar' para otimizar a recuperação. A rotina 'Treino Antigo' foi removida. O que acha do novo plano?" (e preencheria o JSON de saída com as ações correspondentes).

Responda SEMPRE com um JSON válido que siga o schema de saída.`,
});

const evolveRoutinePlanFlow = ai.defineFlow(
  {
    name: 'evolveRoutinePlanFlow',
    inputSchema: EvolveRoutinePlanInputSchema,
    outputSchema: EvolveRoutinePlanOutputSchema,
  },
  async (input) => {
    // Em um cenário real, aqui você poderia adicionar "tools" para a IA
    // interagir com um banco de dados de exercícios ou salvar planos.
    const { output } = await prompt(input);
    return output!;
  }
);

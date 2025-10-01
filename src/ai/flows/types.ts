/**
 * @fileOverview Tipos e esquemas compartilhados para os fluxos de IA.
 */
import {z} from 'genkit';

// Tipos para generateDailyTip
export const GenerateDailyTipInputSchema = z.object({
  workoutHistory: z.string().describe("O histórico de treinos do usuário nos últimos 30 dias, em formato JSON."),
});
export type GenerateDailyTipInput = z.infer<typeof GenerateDailyTipInputSchema>;

export const GenerateDailyTipOutputSchema = z.object({
  tip: z.string().describe('Uma única dica concisa e acionável para o usuário, baseada em seu histórico de treinos. A dica deve ser relevante para o progresso, forma, consistência, nutrição ou mentalidade do usuário. A resposta deve ser em português do Brasil.'),
});
export type GenerateDailyTipOutput = z.infer<typeof GenerateDailyTipOutputSchema>;


// Tipos para generateProgressVisualizations
export const GenerateProgressVisualizationsInputSchema = z.object({
  workoutData: z.string().describe('Dados de treino em formato JSON, incluindo nome do exercício, séries, repetições, peso e data.'),
  personalRecords: z.string().describe('Dados de recordes pessoais em formato JSON, incluindo nome do exercício e valor do recorde.'),
  workoutHistory: z.string().describe('Dados do histórico de treinos em formato JSON, incluindo nome do exercício, data, séries, repetições e peso.'),
});
export type GenerateProgressVisualizationsInput = z.infer<typeof GenerateProgressVisualizationsInputSchema>;

export const GenerateProgressVisualizationsOutputSchema = z.object({
  progressVisualization: z.string().describe('Uma descrição da visualização do progresso, incluindo sugestões de aumentos incrementais de carga.'),
});
export type GenerateProgressVisualizationsOutput = z.infer<typeof GenerateProgressVisualizationsOutputSchema>;


// Tipos para generateRoutine
export const GenerateRoutineInputSchema = z.object({
  objetivo: z.string().describe('O principal objetivo do treino (ex: Hipertrofia, Força, Emagrecimento).'),
  nivelExperiencia: z.string().describe('O nível de experiência do usuário (Iniciante, Intermediário, Avançado).'),
  diasPorSemana: z.number().describe('O número de dias por semana que o usuário pode treinar.'),
  observacoes: z.string().optional().describe('Quaisquer observações ou preferências adicionais.'),
  exerciciosDisponiveis: z.string().describe('Uma lista em formato JSON de todos os exercícios disponíveis que podem ser incluídos na rotina.')
});
export type GenerateRoutineInput = z.infer<typeof GenerateRoutineInputSchema>;

const ExercicioDeRotinaSchema = z.object({
    exercicioId: z.string(),
    nomeExercicio: z.string(),
    seriesAlvo: z.number(),
    repeticoesAlvo: z.number(),
});

export const GenerateRoutineOutputSchema = z.object({
  nome: z.string().describe('Um nome criativo e apropriado para a rotina de treino gerada.'),
  exercicios: z.array(ExercicioDeRotinaSchema).describe('A lista de exercícios que compõem a rotina.'),
});
export type GenerateRoutineOutput = z.infer<typeof GenerateRoutineOutputSchema>;

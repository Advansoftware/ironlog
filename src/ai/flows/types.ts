
/**
 * @fileOverview Tipos e esquemas compartilhados para os fluxos de IA.
 * Este arquivo centraliza as definições de schemas Zod e tipos TypeScript
 * para garantir consistência e segurança de tipo entre os diferentes fluxos de IA
 * e os componentes que os consomem.
 */
import { z } from 'genkit';

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
export const ExercicioDeRotinaSchema = z.object({
  exercicioId: z.string(),
  nomeExercicio: z.string(),
  seriesAlvo: z.number(),
  repeticoesAlvo: z.number(),
  pesoAlvo: z.number().optional(),
});
export type ExercicioDeRotina = z.infer<typeof ExercicioDeRotinaSchema>;

export const GenerateRoutineInputSchema = z.object({
  objetivo: z.string().describe('O principal objetivo do treino (ex: Hipertrofia, Força, Emagrecimento).'),
  nivelExperiencia: z.string().describe('O nível de experiência do usuário (Iniciante, Intermediário, Avançado).'),
  diasPorSemana: z.number().describe('O número de dias por semana que o usuário pode treinar.'),
  localDeTreino: z.string().describe('Onde o usuário vai treinar, indicando os equipamentos disponíveis (ex: "Academia", "Casa").'),
  observacoes: z.string().optional().describe('Quaisquer observações ou preferências adicionais.'),
  exerciciosDisponiveis: z.string().describe('Uma lista em formato JSON de todos os exercícios disponíveis que podem ser incluídos na rotina.')
});
export type GenerateRoutineInput = z.infer<typeof GenerateRoutineInputSchema>;

export const GenerateRoutineOutputSchema = z.object({
  nome: z.string().describe('Um nome criativo e apropriado para a rotina de treino gerada.'),
  exercicios: z.array(ExercicioDeRotinaSchema).describe('A lista de exercícios que compõem a rotina.'),
});
export type GenerateRoutineOutput = z.infer<typeof GenerateRoutineOutputSchema>;


// Tipos para suggestRoutineEvolution
export const SuggestRoutineEvolutionInputSchema = z.object({
  newLevel: z.number().describe("O novo nível que o usuário alcançou."),
  workoutHistory: z.string().describe("O histórico de treinos do usuário nos últimos 30-60 dias, em formato JSON."),
  personalRecords: z.string().describe('Dados de recordes pessoais em formato JSON, incluindo nome do exercício e valor do recorde.'),
});
export type SuggestRoutineEvolutionInput = z.infer<typeof SuggestRoutineEvolutionInputSchema>;

export const SuggestRoutineEvolutionOutputSchema = z.object({
  suggestion: z.string().describe('Uma sugestão curta e motivadora para a próxima fase do treinamento, terminando com uma pergunta para engajar o usuário.'),
});
export type SuggestRoutineEvolutionOutput = z.infer<typeof SuggestRoutineEvolutionOutputSchema>;

// Tipos para EvolveRoutinePlan (e outros fluxos baseados em plano)

export const RotinaParaModificarSchema = z.object({
  id: z.string(),
  nome: z.string(),
  exercicios: z.array(ExercicioDeRotinaSchema)
});
export type RotinaParaModificar = z.infer<typeof RotinaParaModificarSchema>;


export const PlanoDeAcaoSchema = z.object({
  rotinasParaCriar: z.array(GenerateRoutineOutputSchema).optional().describe("Novas rotinas a serem criadas."),
  rotinasParaModificar: z.array(RotinaParaModificarSchema).optional().describe("Rotinas existentes a serem modificadas."),
  rotinasParaRemover: z.array(z.string()).optional().describe("IDs de rotinas existentes a serem removidas."),
  mensagemDeAcompanhamento: z.string().describe("Uma mensagem para o usuário explicando as mudanças ou fazendo a próxima pergunta."),
  xpInicial: z.number().optional().describe("XP inicial a ser concedido ao usuário com base no nível de experiência avaliado."),
  correcaoCompleta: z.boolean().optional().describe("Indica se é uma correção completa do perfil (true) ou apenas evolução normal (false)."),
  novoXp: z.number().optional().describe("Novo XP a ser definido quando houver correção de nível incorreto do onboarding inicial. Omitir se correcaoCompleta=false."),
  motivoCorrecao: z.string().optional().describe("Explicação do motivo da correção quando correcaoCompleta=true. Omitir se correcaoCompleta=false.")
});
export type PlanoDeAcao = z.infer<typeof PlanoDeAcaoSchema>;


export const EvolveRoutinePlanInputSchema = z.object({
  historicoConversa: z.string().describe("O histórico da conversa com o usuário, em formato JSON."),
  rotinasAtuais: z.string().describe("As rotinas de treino atuais do usuário, em formato JSON."),
  historicoTreinos: z.string().describe("O histórico de treinos do usuário, em formato JSON."),
  recordesPessoais: z.string().describe("Os recordes pessoais do usuário, em formato JSON."),
  exerciciosDisponiveis: z.string().describe('Uma lista em formato JSON de todos os exercícios disponíveis que podem ser incluídos na rotina.'),
  nivelUsuario: z.number().describe("O nível atual do usuário."),
});
export type EvolveRoutinePlanInput = z.infer<typeof EvolveRoutinePlanInputSchema>;

export const EvolveRoutinePlanOutputSchema = PlanoDeAcaoSchema;
export type EvolveRoutinePlanOutput = z.infer<typeof EvolveRoutinePlanOutputSchema>;


// Tipos para InitializeUserPlan
export const InitializeUserPlanInputSchema = z.object({
  historicoConversa: z.string().describe("O histórico da conversa com o novo usuário, em formato JSON."),
  exerciciosDisponiveis: z.string().describe('Uma lista em formato JSON de todos os exercícios disponíveis que podem ser incluídos na rotina.'),
});
export type InitializeUserPlanInput = z.infer<typeof InitializeUserPlanInputSchema>;

// A saída é a mesma do fluxo de evolução, pois a ação final é um plano.
export const InitializeUserPlanOutputSchema = EvolveRoutinePlanOutputSchema;
export type InitializeUserPlanOutput = z.infer<typeof InitializeUserPlanOutputSchema>;


/**
 * @fileOverview Definições de Tipos Globais.
 * Este arquivo contém as interfaces TypeScript que definem a estrutura dos principais
 * objetos de dados usados em todo o aplicativo, garantindo consistência e segurança de tipo.
 */

/**
 * Representa os principais grupos musculares que podem ser alvo de um exercício.
 */
export type GrupoMuscular = 'Peito' | 'Costas' | 'Pernas' | 'Ombros' | 'Braços' | 'Core';

/**
 * Representa um único exercício na biblioteca de exercícios.
 */
export type Exercicio = {
  id: string;
  nome: string;
  grupoMuscular: GrupoMuscular;
  equipamento?: string; // Ex: 'Barra', 'Halteres', 'Máquina', 'Peso do Corpo'
};

/**
 * Representa um exercício dentro de uma rotina de treino, com metas específicas.
 */
export type ExercicioDeRotina = {
  exercicioId: string;
  nomeExercicio: string;
  seriesAlvo: number;
  repeticoesAlvo: number;
  pesoAlvo?: number; // Peso sugerido (opcional)
};

/**
 * Representa uma rotina de treino completa, composta por um nome e uma lista de exercícios.
 */
export type RotinaDeTreino = {
  id: string;
  nome: string;
  exercicios: ExercicioDeRotina[];
};

/**
 * Representa uma única série (set) registrada durante uma sessão de treino.
 */
export type SerieRegistrada = {
  reps: number;
  peso: number;
  concluido: boolean;
};

/**
 * Representa um exercício completo registrado em uma sessão, com todas as suas séries.
 */
export type ExercicioRegistrado = {
  exercicioId: string;
  series: SerieRegistrada[];
};

/**
 * Representa uma sessão de treino completa, que é salva no histórico.
 */
export type SessaoDeTreino = {
  id: string;
  rotinaId?: string; // ID da rotina usada, se aplicável
  nome: string; // Nome da rotina ou da sessão
  data: string; // Data em formato ISO string
  exercicios: ExercicioRegistrado[];
  duracao: number; // Duração total em minutos
  xpGanho: number; // XP ganho nesta sessão específica
};

/**
 * Representa um recorde pessoal (Personal Record - PR) para um exercício específico.
 */
export type RecordePessoal = {
  exercicioId: string;
  peso: number;
  reps: number;
  data: string; // Data em formato ISO string em que o recorde foi batido
};

/**
 * Representa o estado de gamificação do usuário.
 */
export type Gamification = {
  xp: number;   // Pontos de experiência totais acumulados
  level: number; // Nível atual do usuário
};

/**
 * Representa a configuração para uma conexão com banco de dados externo (para sincronização).
 */
export type DbConnectionConfig = {
  id: string;
  name: string;
  url: string;
  email: string;
  password?: string;
}

    
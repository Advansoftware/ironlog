export type GrupoMuscular = 'Peito' | 'Costas' | 'Pernas' | 'Ombros' | 'Braços' | 'Core';

export type Exercicio = {
  id: string;
  nome: string;
  grupoMuscular: GrupoMuscular;
};

export type ExercicioDeRotina = {
  exercicioId: string;
  seriesAlvo: number;
  repeticoesAlvo: number;
  pesoAlvo?: number;
};

export type RotinaDeTreino = {
  id: string;
  nome: string;
  exercicios: ExercicioDeRotina[];
};

export type SerieRegistrada = {
  reps: number;
  peso: number;
  concluido: boolean;
};

export type ExercicioRegistrado = {
  exercicioId: string;
  series: SerieRegistrada[];
};

export type SessaoDeTreino = {
  id: string;
  rotinaId?: string;
  nome: string;
  data: string; // ISO string
  exercicios: ExercicioRegistrado[];
  duracao: number; // in minutes
};

export type RecordePessoal = {
  exercicioId: string;
  peso: number;
  reps: number;
  data: string;
};

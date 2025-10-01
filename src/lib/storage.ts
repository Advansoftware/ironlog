'use client';

import type { Exercicio, RotinaDeTreino, SessaoDeTreino, RecordePessoal, GrupoMuscular } from '@/lib/types';

const isBrowser = typeof window !== 'undefined';

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao ler do localStorage [${key}]:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (!isBrowser) {
    return;
  }
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Erro ao salvar no localStorage [${key}]:`, error);
  }
}

const initialExercises: Exercicio[] = [
    { id: 'ex1', nome: 'Supino Reto', grupoMuscular: 'Peito' },
    { id: 'ex2', nome: 'Supino Inclinado com Halteres', grupoMuscular: 'Peito' },
    { id: 'ex3', nome: 'Crucifixo com Halteres', grupoMuscular: 'Peito' },
    { id: 'ex4', nome: 'Barra Fixa', grupoMuscular: 'Costas' },
    { id: 'ex5', nome: 'Remada Curvada', grupoMuscular: 'Costas' },
    { id: 'ex6', nome: 'Levantamento Terra', grupoMuscular: 'Costas' },
    { id: 'ex7', nome: 'Agachamento', grupoMuscular: 'Pernas' },
    { id: 'ex8', nome: 'Leg Press', grupoMuscular: 'Pernas' },
    { id: 'ex9', nome: 'Afundo', grupoMuscular: 'Pernas' },
    { id: 'ex10', nome: 'Desenvolvimento com Barra', grupoMuscular: 'Ombros' },
    { id: 'ex11', nome: 'Elevação Lateral', grupoMuscular: 'Ombros' },
    { id: 'ex12', nome: 'Rosca Direta', grupoMuscular: 'Braços' },
    { id: 'ex13', nome: 'Tríceps Pulley', grupoMuscular: 'Braços' },
    { id: 'ex14', nome: 'Prancha', grupoMuscular: 'Core' },
    { id: 'ex15', nome: 'Abdominal', grupoMuscular: 'Core' },
];

const initialRoutines: RotinaDeTreino[] = [
  {
    id: 'rt1',
    nome: 'Dia de Empurrar',
    exercicios: [
      { exercicioId: 'ex1', seriesAlvo: 3, repeticoesAlvo: 5, pesoAlvo: 100 },
      { exercicioId: 'ex2', seriesAlvo: 3, repeticoesAlvo: 8, pesoAlvo: 30 },
      { exercicioId: 'ex10', seriesAlvo: 3, repeticoesAlvo: 8, pesoAlvo: 60 },
      { exercicioId: 'ex13', seriesAlvo: 3, repeticoesAlvo: 12, pesoAlvo: 20 },
    ],
  },
  {
    id: 'rt2',
    nome: 'Dia de Puxar',
    exercicios: [
      { exercicioId: 'ex4', seriesAlvo: 3, repeticoesAlvo: 8 },
      { exercicioId: 'ex5', seriesAlvo: 3, repeticoesAlvo: 8 },
      { exercicioId: 'ex12', seriesAlvo: 3, repeticoesAlvo: 12 },
    ],
  },
  {
    id: 'rt3',
    nome: 'Dia de Pernas',
    exercicios: [
      { exercicioId: 'ex7', seriesAlvo: 3, repeticoesAlvo: 5 },
      { exercicioId: 'ex8', seriesAlvo: 3, repeticoesAlvo: 10 },
      { exercicioId: 'ex9', seriesAlvo: 3, repeticoesAlvo: 12 },
    ],
  },
];


// Inicializa os dados se não existirem
if (isBrowser && !localStorage.getItem('bibliotecaDeExercicios')) {
  saveToStorage('bibliotecaDeExercicios', initialExercises);
}
if (isBrowser && !localStorage.getItem('rotinas')) {
    saveToStorage('rotinas', initialRoutines);
}
if (isBrowser && !localStorage.getItem('historico')) {
    saveToStorage('historico', []);
}
if (isBrowser && !localStorage.getItem('recordesPessoais')) {
    saveToStorage('recordesPessoais', []);
}


export const getBibliotecaDeExercicios = () => getFromStorage<Exercicio[]>('bibliotecaDeExercicios', []);
export const getRotinas = () => getFromStorage<RotinaDeTreino[]>('rotinas', []);
export const getHistorico = () => getFromStorage<SessaoDeTreino[]>('historico', []);
export const getRecordesPessoais = () => getFromStorage<RecordePessoal[]>('recordesPessoais', []);

export const salvarRotinas = (rotinas: RotinaDeTreino[]) => saveToStorage('rotinas', rotinas);
export const salvarHistorico = (historico: SessaoDeTreino[]) => saveToStorage('historico', historico);
export const salvarRecordesPessoais = (recordes: RecordePessoal[]) => saveToStorage('recordesPessoais', recordes);


export const gruposMusculares: GrupoMuscular[] = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];

export function getNomeExercicio(exercicioId: string) {
    const biblioteca = getBibliotecaDeExercicios();
    return biblioteca.find(ex => ex.id === exercicioId)?.nome ?? 'Exercício Desconhecido';
}

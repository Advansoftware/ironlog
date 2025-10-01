
'use client';

import type { Exercicio, RotinaDeTreino, SessaoDeTreino, RecordePessoal, GrupoMuscular, Gamification } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { calculateXP, checkForLevelUp } from './gamification';

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
    // Dispara um evento para notificar outras abas/componentes
    window.dispatchEvent(new Event('storage'));
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
    nome: 'Dia de Empurrar (Exemplo)',
    exercicios: [
      { exercicioId: 'ex1', nomeExercicio: "Supino Reto", seriesAlvo: 3, repeticoesAlvo: 5, pesoAlvo: 100 },
      { exercicioId: 'ex2', nomeExercicio: "Supino Inclinado com Halteres", seriesAlvo: 3, repeticoesAlvo: 8, pesoAlvo: 30 },
      { exercicioId: 'ex10', nomeExercicio: "Desenvolvimento com Barra", seriesAlvo: 3, repeticoesAlvo: 8, pesoAlvo: 60 },
      { exercicioId: 'ex13', nomeExercicio: "Tríceps Pulley", seriesAlvo: 3, repeticoesAlvo: 12, pesoAlvo: 20 },
    ],
  },
  {
    id: 'rt2',
    nome: 'Dia de Puxar (Exemplo)',
    exercicios: [
      { exercicioId: 'ex4', nomeExercicio: "Barra Fixa", seriesAlvo: 3, repeticoesAlvo: 8 },
      { exercicioId: 'ex5', nomeExercicio: "Remada Curvada", seriesAlvo: 3, repeticoesAlvo: 8 },
      { exercicioId: 'ex12', nomeExercicio: "Rosca Direta", seriesAlvo: 3, repeticoesAlvo: 12 },
    ],
  },
];

const initialGamification: Gamification = { xp: 0, level: 1 };

function initializeStorage() {
    if (!isBrowser) return;
    if (localStorage.getItem('appDataInitialized')) return;

    saveToStorage('bibliotecaDeExercicios', initialExercises);
    saveToStorage('rotinas', initialRoutines);
    saveToStorage('historico', []);
    saveToStorage('recordesPessoais', []);
    saveToStorage('gamification', initialGamification);
    localStorage.setItem('appDataInitialized', 'true');
}

initializeStorage();


export const getBibliotecaDeExercicios = () => getFromStorage<Exercicio[]>('bibliotecaDeExercicios', []);
export const getRotinas = () => getFromStorage<RotinaDeTreino[]>('rotinas', []);
export const getHistorico = () => getFromStorage<SessaoDeTreino[]>('historico', []);
export const getRecordesPessoais = () => getFromStorage<RecordePessoal[]>('recordesPessoais', []);
export const getGamification = () => getFromStorage<Gamification>('gamification', initialGamification);

export const salvarRotinas = (rotinas: RotinaDeTreino[]) => saveToStorage('rotinas', rotinas);

export const deletarRotina = (id: string) => {
  const rotinas = getRotinas();
  const novasRotinas = rotinas.filter(r => r.id !== id);
  saveToStorage('rotinas', novasRotinas);
}

export const salvarRotina = (rotina: RotinaDeTreino) => {
    const rotinas = getRotinas();
    saveToStorage('rotinas', [rotina, ...rotinas]);
};

export const atualizarRotina = (rotinaAtualizada: RotinaDeTreino) => {
    const rotinas = getRotinas();
    const index = rotinas.findIndex(r => r.id === rotinaAtualizada.id);
    if (index !== -1) {
        rotinas[index] = rotinaAtualizada;
        saveToStorage('rotinas', rotinas);
    }
};


export const salvarSessao = (sessao: Omit<SessaoDeTreino, 'id' | 'xpGanho'>, novosRecordes: RecordePessoal[]) => {
    const historico = getHistorico();
    const gamification = getGamification();

    const xpGanho = calculateXP(sessao.exercicios);
    const newTotalXp = gamification.xp + xpGanho;
    
    const sessaoCompleta: SessaoDeTreino = {
      ...sessao,
      id: uuidv4(),
      xpGanho,
    };

    saveToStorage('historico', [sessaoCompleta, ...historico]);

    const levelUpInfo = checkForLevelUp(gamification.xp, newTotalXp);
    saveToStorage('gamification', { xp: newTotalXp, level: levelUpInfo.newLevel });
    
    if (levelUpInfo.didLevelUp && isBrowser) {
        sessionStorage.setItem('justLeveledUp', 'true');
    }

    if (novosRecordes.length > 0) {
        const recordesAtuais = getRecordesPessoais();
        const recordesAtualizados = [...recordesAtuais];

        novosRecordes.forEach(novoPR => {
            const index = recordesAtualizados.findIndex(pr => pr.exercicioId === novoPR.exercicioId);
            if (index !== -1) {
                recordesAtualizados[index] = novoPR;
            } else {
                recordesAtualizados.push(novoPR);
            }
        });

        saveToStorage('recordesPessoais', recordesAtualizados);
    }
    return { levelUpInfo, xpGanho };
};

export const salvarRecordesPessoais = (recordes: RecordePessoal[]) => saveToStorage('recordesPessoais', recordes);


export const gruposMusculares: GrupoMuscular[] = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];

export function getNomeExercicio(exercicioId: string) {
    const biblioteca = getBibliotecaDeExercicios();
    return biblioteca.find(ex => ex.id === exercicioId)?.nome ?? 'Exercício Desconhecido';
}

export function resetAllData() {
    if (!isBrowser) return;
    
    localStorage.removeItem('bibliotecaDeExercicios');
    localStorage.removeItem('rotinas');
    localStorage.removeItem('historico');
    localStorage.removeItem('recordesPessoais');
    localStorage.removeItem('gamification');
    localStorage.removeItem('appDataInitialized');

    initializeStorage();
    window.dispatchEvent(new Event('storage'));
}

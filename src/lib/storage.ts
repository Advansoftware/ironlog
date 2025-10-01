
'use client';

import type { Exercicio, RotinaDeTreino, SessaoDeTreino, RecordePessoal, GrupoMuscular, Gamification, DbConnectionConfig } from '@/lib/types';
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
    // Peito
    { id: 'ex1', nome: 'Supino Reto com Barra', grupoMuscular: 'Peito', equipamento: 'Barra' },
    { id: 'ex2', nome: 'Supino Inclinado com Halteres', grupoMuscular: 'Peito', equipamento: 'Halteres' },
    { id: 'ex3', nome: 'Crucifixo com Halteres', grupoMuscular: 'Peito', equipamento: 'Halteres' },
    { id: 'ex16', nome: 'Flexão de Braço', grupoMuscular: 'Peito', equipamento: 'Peso do Corpo' },
    { id: 'ex17', nome: 'Supino Declinado com Barra', grupoMuscular: 'Peito', equipamento: 'Barra' },
    { id: 'ex18', nome: 'Peck Deck (Voador)', grupoMuscular: 'Peito', equipamento: 'Máquina' },
    { id: 'ex19', nome: 'Crossover (Polia)', grupoMuscular: 'Peito', equipamento: 'Polia' },

    // Costas
    { id: 'ex4', nome: 'Barra Fixa', grupoMuscular: 'Costas', equipamento: 'Peso do Corpo' },
    { id: 'ex5', nome: 'Remada Curvada com Barra', grupoMuscular: 'Costas', equipamento: 'Barra' },
    { id: 'ex6', nome: 'Levantamento Terra', grupoMuscular: 'Costas', equipamento: 'Barra' },
    { id: 'ex20', nome: 'Puxada Frontal (Pulley)', grupoMuscular: 'Costas', equipamento: 'Polia' },
    { id: 'ex21', nome: 'Remada Sentada (Máquina)', grupoMuscular: 'Costas', equipamento: 'Máquina' },
    { id: 'ex22', nome: 'Remada Cavalinho', grupoMuscular: 'Costas', equipamento: 'Máquina' },
    { id: 'ex23', nome: 'Remada Unilateral com Halter (Serrote)', grupoMuscular: 'Costas', equipamento: 'Halteres' },
    { id: 'ex24', nome: 'Pull-over com Halter', grupoMuscular: 'Costas', equipamento: 'Halteres' },

    // Pernas
    { id: 'ex7', nome: 'Agachamento Livre com Barra', grupoMuscular: 'Pernas', equipamento: 'Barra' },
    { id: 'ex8', nome: 'Leg Press 45', grupoMuscular: 'Pernas', equipamento: 'Máquina' },
    { id: 'ex9', nome: 'Afundo com Halteres', grupoMuscular: 'Pernas', equipamento: 'Halteres' },
    { id: 'ex25', nome: 'Cadeira Extensora', grupoMuscular: 'Pernas', equipamento: 'Máquina' },
    { id: 'ex26', nome: 'Mesa Flexora', grupoMuscular: 'Pernas', equipamento: 'Máquina' },
    { id: 'ex27', nome: 'Agachamento Búlgaro com Halteres', grupoMuscular: 'Pernas', equipamento: 'Halteres' },
    { id: 'ex28', nome: 'Levantamento Terra Romeno (Stiff)', grupoMuscular: 'Pernas', equipamento: 'Barra' },
    { id: 'ex29', nome: 'Cadeira Adutora', grupoMuscular: 'Pernas', equipamento: 'Máquina' },
    { id: 'ex30', nome: 'Cadeira Abdutora', grupoMuscular: 'Pernas', equipamento: 'Máquina' },
    { id: 'ex31', nome: 'Elevação de Panturrilha em Pé', grupoMuscular: 'Pernas', equipamento: 'Máquina' },
    { id: 'ex32', nome: 'Agachamento com Peso do Corpo', grupoMuscular: 'Pernas', equipamento: 'Peso do Corpo' },

    // Ombros
    { id: 'ex10', nome: 'Desenvolvimento com Barra', grupoMuscular: 'Ombros', equipamento: 'Barra' },
    { id: 'ex11', nome: 'Elevação Lateral com Halteres', grupoMuscular: 'Ombros', equipamento: 'Halteres' },
    { id: 'ex33', nome: 'Desenvolvimento Arnold com Halteres', grupoMuscular: 'Ombros', equipamento: 'Halteres' },
    { id: 'ex34', nome: 'Elevação Frontal com Halteres', grupoMuscular: 'Ombros', equipamento: 'Halteres' },
    { id: 'ex35', nome: 'Remada Alta', grupoMuscular: 'Ombros', equipamento: 'Barra' },
    { id: 'ex36', nome: 'Crucifixo Invertido (Máquina ou Halteres)', grupoMuscular: 'Ombros', equipamento: 'Máquina' },

    // Braços
    { id: 'ex12', nome: 'Rosca Direta com Barra', grupoMuscular: 'Braços', equipamento: 'Barra' },
    { id: 'ex13', nome: 'Tríceps Pulley com Corda', grupoMuscular: 'Braços', equipamento: 'Polia' },
    { id: 'ex37', nome: 'Rosca Alternada com Halteres', grupoMuscular: 'Braços', equipamento: 'Halteres' },
    { id: 'ex38', nome: 'Tríceps Testa com Barra', grupoMuscular: 'Braços', equipamento: 'Barra' },
    { id: 'ex39', nome: 'Rosca Martelo com Halteres', grupoMuscular: 'Braços', equipamento: 'Halteres' },
    { id: 'ex40', nome: 'Tríceps Francês com Halter', grupoMuscular: 'Braços', equipamento: 'Halteres' },
    { id: 'ex41', nome: 'Rosca Concentrada', grupoMuscular: 'Braços', equipamento: 'Halteres' },
    { id: 'ex42', nome: 'Mergulho no Banco', grupoMuscular: 'Braços', equipamento: 'Peso do Corpo' },

    // Core
    { id: 'ex14', nome: 'Prancha Abdominal', grupoMuscular: 'Core', equipamento: 'Peso do Corpo' },
    { id: 'ex15', nome: 'Abdominal Crunch', grupoMuscular: 'Core', equipamento: 'Peso do Corpo' },
    { id: 'ex43', nome: 'Elevação de Pernas', grupoMuscular: 'Core', equipamento: 'Peso do Corpo' },
    { id: 'ex44', nome: 'Abdominal Russo com Peso', grupoMuscular: 'Core', equipamento: 'Halteres' },
    { id: 'ex45', nome: 'Prancha Lateral', grupoMuscular: 'Core', equipamento: 'Peso do Corpo' }
];


const initialRoutines: RotinaDeTreino[] = [
  {
    id: 'rt1',
    nome: 'Dia de Empurrar (Exemplo)',
    exercicios: [
      { exercicioId: 'ex1', nomeExercicio: "Supino Reto com Barra", seriesAlvo: 3, repeticoesAlvo: 5, pesoAlvo: 100 },
      { exercicioId: 'ex2', nomeExercicio: "Supino Inclinado com Halteres", seriesAlvo: 3, repeticoesAlvo: 8, pesoAlvo: 30 },
      { exercicioId: 'ex10', nomeExercicio: "Desenvolvimento com Barra", seriesAlvo: 3, repeticoesAlvo: 8, pesoAlvo: 60 },
      { exercicioId: 'ex13', nomeExercicio: "Tríceps Pulley com Corda", seriesAlvo: 3, repeticoesAlvo: 12, pesoAlvo: 20 },
    ],
  },
  {
    id: 'rt2',
    nome: 'Dia de Puxar (Exemplo)',
    exercicios: [
      { exercicioId: 'ex4', nomeExercicio: "Barra Fixa", seriesAlvo: 3, repeticoesAlvo: 8 },
      { exercicioId: 'ex5', nomeExercicio: "Remada Curvada com Barra", seriesAlvo: 3, repeticoesAlvo: 8 },
      { exercicioId: 'ex12', nomeExercicio: "Rosca Direta com Barra", seriesAlvo: 3, repeticoesAlvo: 12 },
    ],
  },
   {
    id: 'rt3',
    nome: 'Dia de Pernas (Exemplo)',
    exercicios: [
      { exercicioId: 'ex7', nomeExercicio: "Agachamento Livre com Barra", seriesAlvo: 4, repeticoesAlvo: 6 },
      { exercicioId: 'ex8', nomeExercicio: "Leg Press 45", seriesAlvo: 3, repeticoesAlvo: 10 },
      { exercicioId: 'ex26', nomeExercicio: "Mesa Flexora", seriesAlvo: 3, repeticoesAlvo: 12 },
      { exercicioId: 'ex31', nomeExercicio: "Elevação de Panturrilha em Pé", seriesAlvo: 4, repeticoesAlvo: 15 },
    ],
  },
];

const initialGamification: Gamification = { xp: 0, level: 1 };

function initializeStorage() {
    if (!isBrowser) return;
    if (localStorage.getItem('appDataInitialized_v2')) return; // Chave de versão para forçar reinicialização

    saveToStorage('bibliotecaDeExercicios', initialExercises);
    saveToStorage('rotinas', initialRoutines);
    saveToStorage('historico', []);
    saveToStorage('recordesPessoais', []);
    saveToStorage('gamification', initialGamification);
    saveToStorage('dbConnections', []);
    localStorage.setItem('appDataInitialized_v2', 'true');
}

initializeStorage();


export const getBibliotecaDeExercicios = () => getFromStorage<Exercicio[]>('bibliotecaDeExercicios', []);

export const salvarExercicio = (exercicio: Omit<Exercicio, 'id'>) => {
    const biblioteca = getBibliotecaDeExercicios();
    const novoExercicio: Exercicio = { ...exercicio, id: uuidv4() };
    saveToStorage('bibliotecaDeExercicios', [...biblioteca, novoExercicio]);
};

export const getRotinas = () => getFromStorage<RotinaDeTreino[]>('rotinas', []);
export const getHistorico = () => getFromStorage<SessaoDeTreino[]>('historico', []);
export const getRecordesPessoais = () => getFromStorage<RecordePessoal[]>('recordesPessoais', []);
export const getGamification = () => getFromStorage<Gamification>('gamification', initialGamification);
export const getDbConnections = () => getFromStorage<DbConnectionConfig[]>('dbConnections', []);

export const saveDbConnections = (connections: DbConnectionConfig[]) => saveToStorage('dbConnections', connections);

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
    localStorage.removeItem('dbConnections');
    localStorage.removeItem('appDataInitialized_v2');

    initializeStorage();
    window.dispatchEvent(new Event('storage'));
}

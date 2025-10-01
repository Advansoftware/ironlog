
'use client';
/**
 * @fileOverview Módulo de gerenciamento de armazenamento local.
 * Este arquivo abstrai as interações com o `localStorage` do navegador para fornecer uma API
 * síncrona e segura para ler e escrever dados da aplicação, como rotinas, histórico, etc.
 * Também inclui a lógica para inicializar o app com dados padrão na primeira execução.
 */

import type { Exercicio, RotinaDeTreino, SessaoDeTreino, RecordePessoal, GrupoMuscular, Gamification, DbConnectionConfig, UnlockedAchievement, AchievementContext } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { calculateXP, checkForLevelUp, allAchievements } from './gamification';
import { toast } from '@/hooks/use-toast';

const isBrowser = typeof window !== 'undefined';

/**
 * Lê um valor do localStorage de forma segura.
 * @param key A chave a ser lida.
 * @param defaultValue O valor padrão a ser retornado se a chave não existir ou ocorrer um erro.
 * @returns O valor parseado do localStorage ou o valor padrão.
 */
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

/**
 * Salva um valor no localStorage de forma segura e dispara um evento de 'storage'.
 * @param key A chave onde o valor será salvo.
 * @param value O valor a ser salvo (será convertido para JSON).
 */
function saveToStorage<T>(key: string, value: T) {
  if (!isBrowser) {
    return;
  }
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
    // Dispara um evento para notificar outras abas/componentes sobre a mudança.
    window.dispatchEvent(new Event('storage'));
  } catch (error)
 {
    console.error(`Erro ao salvar no localStorage [${key}]:`, error);
  }
}

// Dados iniciais para popular o aplicativo na primeira vez que é aberto.
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

const initialGamification: Gamification = { xp: 0, level: 1 };

/**
 * Popula o localStorage com dados iniciais se for a primeira vez que o usuário abre o aplicativo.
 * Utiliza uma chave de versionamento para permitir futuras migrações ou reset de dados.
 */
function initializeStorage() {
    if (!isBrowser) return;
    if (localStorage.getItem('appDataInitialized_v3')) return;

    saveToStorage('bibliotecaDeExercicios', initialExercises);
    saveToStorage('rotinas', []);
    saveToStorage('historico', []);
    saveToStorage('recordesPessoais', []);
    saveToStorage('gamification', initialGamification);
    saveToStorage('dbConnections', []);
    saveToStorage('unlockedAchievements', []);
    localStorage.setItem('appDataInitialized_v3', 'true');
}

// Executa a inicialização na primeira carga do script.
initializeStorage();


// Funções de Leitura (Getters)
export const getBibliotecaDeExercicios = () => getFromStorage<Exercicio[]>('bibliotecaDeExercicios', []);
export const getRotinas = () => getFromStorage<RotinaDeTreino[]>('rotinas', []);
export const getHistorico = () => getFromStorage<SessaoDeTreino[]>('historico', []);
export const getRecordesPessoais = () => getFromStorage<RecordePessoal[]>('recordesPessoais', []);
export const getGamification = () => getFromStorage<Gamification>('gamification', initialGamification);
export const getUnlockedAchievements = () => getFromStorage<UnlockedAchievement[]>('unlockedAchievements', []);
export const getDbConnections = () => getFromStorage<DbConnectionConfig[]>('dbConnections', []);


// Funções de Escrita (Setters)

/**
 * Salva um novo exercício na biblioteca de exercícios.
 * @param exercicio O objeto do exercício a ser salvo (sem o id).
 */
export const salvarExercicio = (exercicio: Omit<Exercicio, 'id'>) => {
    const biblioteca = getBibliotecaDeExercicios();
    const novoExercicio: Exercicio = { ...exercicio, id: uuidv4() };
    saveToStorage('bibliotecaDeExercicios', [...biblioteca, novoExercicio]);
};

/**
 * Salva uma nova rotina na lista de rotinas.
 * @param rotina O objeto da rotina a ser salvo.
 */
export const salvarRotina = (rotina: RotinaDeTreino) => {
    const rotinas = getRotinas();
    saveToStorage('rotinas', [rotina, ...rotinas]);
};

/**
 * Atualiza uma rotina existente.
 * @param rotinaAtualizada O objeto da rotina com as informações atualizadas.
 */
export const atualizarRotina = (rotinaAtualizada: RotinaDeTreino) => {
    const rotinas = getRotinas();
    const index = rotinas.findIndex(r => r.id === rotinaAtualizada.id);
    if (index !== -1) {
        rotinas[index] = rotinaAtualizada;
        saveToStorage('rotinas', rotinas);
    }
};

/**
 * Remove uma rotina da lista.
 * @param id O ID da rotina a ser deletada.
 */
export const deletarRotina = (id: string) => {
  const rotinas = getRotinas();
  const novasRotinas = rotinas.filter(r => r.id !== id);
  saveToStorage('rotinas', novasRotinas);
}

/**
 * Salva a lista completa de conexões de banco de dados.
 * @param connections A lista de configurações de conexão.
 */
export const saveDbConnections = (connections: DbConnectionConfig[]) => saveToStorage('dbConnections', connections);

/**
 * Salva uma sessão de treino completa, calcula o XP ganho, verifica se houve level up
 * e atualiza os recordes pessoais.
 * @param sessao O objeto da sessão de treino a ser salvo.
 * @param novosRecordes Uma lista de novos recordes pessoais batidos nesta sessão.
 * @returns Um objeto com informações sobre o level up e o XP ganho.
 */
export const salvarSessao = (sessao: Omit<SessaoDeTreino, 'id' | 'xpGanho'>, novosRecordes: RecordePessoal[]) => {
    const historicoAnterior = getHistorico();
    const gamificationAnterior = getGamification();

    const xpGanho = calculateXP(sessao.exercicios);
    const newTotalXp = gamificationAnterior.xp + xpGanho;
    
    const sessaoCompleta: SessaoDeTreino = {
      ...sessao,
      id: uuidv4(),
      xpGanho,
    };

    const novoHistorico = [sessaoCompleta, ...historicoAnterior];
    saveToStorage('historico', novoHistorico);

    const levelUpInfo = checkForLevelUp(gamificationAnterior.xp, newTotalXp);
    const novaGamification = { xp: newTotalXp, level: levelUpInfo.newLevel };
    saveToStorage('gamification', novaGamification);
    
    // Armazena um flag na sessionStorage para notificar o app que o usuário acabou de subir de nível.
    // A sessionStorage é usada aqui porque este é um estado temporário que não precisa persistir.
    if (levelUpInfo.didLevelUp && isBrowser) {
        sessionStorage.setItem('justLeveledUp', 'true');
    }

    // Atualiza os recordes pessoais se houver novos.
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
    
    // Verifica por novas conquistas
    checkForNewAchievements(sessaoCompleta);

    return { levelUpInfo, xpGanho };
};

/**
 * Verifica se alguma nova conquista foi desbloqueada após uma sessão.
 * @param latestSession A sessão de treino que acabou de ser concluída.
 */
function checkForNewAchievements(latestSession: SessaoDeTreino) {
    const unlocked = getUnlockedAchievements();
    const unlockedIds = new Set(unlocked.map(a => a.id));

    const context: AchievementContext = {
        historico: getHistorico(),
        rotinas: getRotinas(),
        recordes: getRecordesPessoais(),
        gamification: getGamification(),
        latestSession,
    };

    const newAchievements: UnlockedAchievement[] = [];

    for (const achievement of allAchievements) {
        if (!unlockedIds.has(achievement.id) && achievement.criteria(context)) {
            newAchievements.push({ id: achievement.id, date: new Date().toISOString() });
            unlocked.push({ id: achievement.id, date: new Date().toISOString() });
        }
    }

    if (newAchievements.length > 0) {
        saveToStorage('unlockedAchievements', unlocked);
        // Dispara um toast para cada nova conquista
        newAchievements.forEach(ach => {
            const achievementData = allAchievements.find(a => a.id === ach.id);
            if (achievementData) {
                 toast({
                    title: "Conquista Desbloqueada!",
                    description: achievementData.name,
                });
            }
        });
    }
}


// Funções Utilitárias

/**
 * Lista de todos os grupos musculares disponíveis no app.
 */
export const gruposMusculares: GrupoMuscular[] = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];

/**
 * Busca o nome de um exercício na biblioteca pelo seu ID.
 * @param exercicioId O ID do exercício.
 * @returns O nome do exercício ou 'Exercício Desconhecido' se não for encontrado.
 */
export function getNomeExercicio(exercicioId: string) {
    const biblioteca = getBibliotecaDeExercicios();
    return biblioteca.find(ex => ex.id === exercicioId)?.nome ?? 'Exercício Desconhecido';
}

/**
 * Apaga todos os dados do usuário do localStorage e reinicializa o app com os dados padrão.
 * Ação destrutiva e irreversível.
 */
export function resetAllData() {
    if (!isBrowser) return;
    
    localStorage.removeItem('bibliotecaDeExercicios');
    localStorage.removeItem('rotinas');
    localStorage.removeItem('historico');
    localStorage.removeItem('recordesPessoais');
    localStorage.removeItem('gamification');
    localStorage.removeItem('unlockedAchievements');
    localStorage.removeItem('dbConnections');
    localStorage.removeItem('appDataInitialized_v3');

    initializeStorage();
    window.dispatchEvent(new Event('storage'));
}

export function hasCompletedOnboarding() {
    return getRotinas().length > 0;
}

    
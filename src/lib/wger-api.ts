/**
 * @fileOverview Integração com a API do WGER para dados de exercícios.
 * Este arquivo contém as funções para buscar informações de exercícios,
 * instruções e imagens da API do WGER.
 */

import type {
  RotinaDeTreino,
  ExercicioDeRotina,
  SessaoDeTreino,
  ExercicioRegistrado,
  WgerConfig
} from './types';

/**
 * Obtém as configurações WGER do usuário do localStorage
 */
function getUserWgerConfig(): WgerConfig {
  if (typeof window === 'undefined') {
    return {
      enabled: false,
      apiUrl: 'https://fit.advansoftware.shop',
      token: '',
      username: ''
    };
  }

  try {
    const stored = localStorage.getItem('wgerConfig');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao ler configuração WGER:', error);
  }

  return {
    enabled: false,
    apiUrl: 'https://fit.advansoftware.shop',
    token: '',
    username: ''
  };
}

/**
 * Verifica se a sincronização WGER está configurada e habilitada
 */
export function isWgerConfigured(): boolean {
  const config = getUserWgerConfig();
  return config.enabled && config.token.trim() !== '' && config.apiUrl.trim() !== '';
}



/**
 * Obtém as credenciais e configurações da API WGER do usuário
 */
function getWgerApiConfig(): { apiUrl: string; token: string } {
  const config = getUserWgerConfig();
  // Garantir que a URL termine com /
  const apiUrl = config.apiUrl.endsWith('/') ? config.apiUrl : config.apiUrl + '/';
  return {
    apiUrl,
    token: config.token
  };
}

// Tipos para os dados da API do WGER
export interface WgerExercise {
  id: number;
  uuid: string;
  category: {
    id: number;
    name: string;
  };
  muscles: Array<{
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
    image_url_main?: string;
  }>;
  muscles_secondary: Array<{
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
    image_url_main?: string;
  }>;
  equipment: Array<{
    id: number;
    name: string;
  }>;
  translations: Array<{
    id: number;
    name: string;
    description: string;
    language: number;
  }>;
  images: Array<{
    id: number;
    image: string;
    is_main: boolean;
  }>;
  videos: Array<{
    id: number;
    video: string;
  }>;
}

export interface MuscleInfo {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
  image_url_main?: string;
}

export interface EquipmentInfo {
  id: number;
  name: string;
}

export interface ExerciseSearchResult {
  name: string;
  description: string;
  instructions: string;
  primaryMuscles: MuscleInfo[];
  secondaryMuscles: MuscleInfo[];
  equipment: EquipmentInfo[];
  category: string;
  images: string[];
  videos: string[];
}

// Cache para evitar requisições desnecessárias
const exerciseCache = new Map<string, ExerciseSearchResult>();

/**
 * Função para buscar exercícios na API do WGER por nome
 * @param exerciseName - Nome do exercício para buscar
 * @param language - Idioma preferido (7 = português, 2 = inglês, 1 = alemão)
 * @returns Informações detalhadas do exercício ou null se não encontrado
 */
export async function searchExerciseByName(
  exerciseName: string,
  language: number = 7
): Promise<ExerciseSearchResult | null> {
  const cacheKey = `${exerciseName.toLowerCase()}-${language}`;

  // Verificar cache primeiro
  if (exerciseCache.has(cacheKey)) {
    return exerciseCache.get(cacheKey)!;
  }

  try {
    if (!isWgerConfigured()) {
      console.warn('⚠️  WGER não configurado ou desabilitado');
      return null;
    }

    const { apiUrl, token } = getWgerApiConfig();
    const url = `${apiUrl}api/v2/exerciseinfo/?limit=50`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error('Erro ao buscar exercícios na API do WGER:', response.status);
      return null;
    }

    const data = await response.json();

    // Buscar exercício por nome nas traduções
    const exercise = findExerciseByName(data.results, exerciseName, language);

    if (!exercise) {
      console.log(`Exercício "${exerciseName}" não encontrado na API do WGER`);
      return null;
    }

    const result = await formatExerciseData(exercise, language);

    // Salvar no cache
    exerciseCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Erro ao conectar com a API do WGER:', error);
    return null;
  }
}

/**
 * Busca um exercício específico pelo ID
 * @param exerciseId - ID do exercício no WGER
 * @param language - Idioma preferido (7 = português)
 * @returns Informações detalhadas do exercício
 */
export async function getExerciseById(
  exerciseId: number,
  language: number = 7
): Promise<ExerciseSearchResult | null> {
  const cacheKey = `id-${exerciseId}-${language}`;

  if (exerciseCache.has(cacheKey)) {
    return exerciseCache.get(cacheKey)!;
  }

  try {
    if (!isWgerConfigured()) {
      console.warn('⚠️  WGER não configurado ou desabilitado');
      return null;
    }

    const { apiUrl, token } = getWgerApiConfig();
    const url = `${apiUrl}api/v2/exerciseinfo/${exerciseId}/`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error('Erro ao buscar exercício por ID:', response.status);
      return null;
    }

    const exercise: WgerExercise = await response.json();
    const result = await formatExerciseData(exercise, language);

    exerciseCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar exercício por ID:', error);
    return null;
  }
}

/**
 * Encontra um exercício por nome nas traduções
 */
function findExerciseByName(
  exercises: WgerExercise[],
  searchName: string,
  preferredLanguage: number
): WgerExercise | null {
  const normalizedSearch = normalizeString(searchName);

  // Primeiro, tentar encontrar uma correspondência exata no idioma preferido
  let bestMatch = exercises.find(exercise => {
    const preferredTranslation = exercise.translations.find(t => t.language === preferredLanguage);
    if (preferredTranslation) {
      return normalizeString(preferredTranslation.name) === normalizedSearch;
    }
    return false;
  });

  if (bestMatch) return bestMatch;

  // Se não encontrou, buscar correspondência parcial no idioma preferido
  bestMatch = exercises.find(exercise => {
    const preferredTranslation = exercise.translations.find(t => t.language === preferredLanguage);
    if (preferredTranslation) {
      const normalizedName = normalizeString(preferredTranslation.name);
      return normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName);
    }
    return false;
  });

  if (bestMatch) return bestMatch;

  // Como último recurso, buscar em qualquer idioma
  return exercises.find(exercise => {
    return exercise.translations.some(translation => {
      const normalizedName = normalizeString(translation.name);
      return normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName);
    });
  }) || null;
}

/**
 * Normaliza uma string para comparação (remove acentos, converte para minúsculas, etc.)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim();
}

/**
 * Busca imagens de um exercício específico
 */
async function fetchExerciseImages(exerciseId: number): Promise<string[]> {
  try {
    if (!isWgerConfigured()) {
      return [];
    }

    const { apiUrl, token } = getWgerApiConfig();
    const url = `${apiUrl}api/v2/exerciseimage/?exercise=${exerciseId}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error('Erro ao buscar imagens:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results?.map((img: any) => {
      const imageUrl = img.image;
      return imageUrl.startsWith('http') ? imageUrl : `${apiUrl}${imageUrl}`;
    }) || [];
  } catch (error) {
    console.error('Erro ao buscar imagens do exercício:', error);
    return [];
  }
}

/**
 * Busca vídeos de um exercício específico
 */
async function fetchExerciseVideos(exerciseId: number): Promise<string[]> {
  try {
    if (!isWgerConfigured()) {
      return [];
    }

    const { apiUrl, token } = getWgerApiConfig();
    const url = `${apiUrl}api/v2/video/?exercise=${exerciseId}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error('Erro ao buscar vídeos:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results?.map((video: any) => {
      const videoUrl = video.video;
      return videoUrl.startsWith('http') ? videoUrl : `${apiUrl}${videoUrl}`;
    }) || [];
  } catch (error) {
    console.error('Erro ao buscar vídeos do exercício:', error);
    return [];
  }
}

/**
 * Extrai links de vídeos do YouTube da descrição
 */
function extractYouTubeLinks(description: string): string[] {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
  const matches = [];
  let match;

  while ((match = youtubeRegex.exec(description)) !== null) {
    matches.push(`https://www.youtube.com/watch?v=${match[1]}`);
  }

  return matches;
}

/**
 * Formata os dados do exercício para o formato usado na aplicação
 */
async function formatExerciseData(exercise: WgerExercise, language: number): Promise<ExerciseSearchResult> {
  // Buscar tradução no idioma preferido (português = 7), depois inglês (2), depois alemão (1)
  const translation = exercise.translations.find(t => t.language === language) ||
    exercise.translations.find(t => t.language === 7) || // português como fallback
    exercise.translations.find(t => t.language === 2) || // inglês como segundo fallback
    exercise.translations[0];

  const name = translation?.name || 'Exercício sem nome';
  const description = translation?.description ?
    stripHtml(translation.description) :
    'Descrição não disponível';

  // Extrair músculos primários e secundários com informações completas
  const primaryMuscles: MuscleInfo[] = exercise.muscles.map(m => ({
    id: m.id,
    name: m.name,
    name_en: m.name_en,
    is_front: m.is_front,
    image_url_main: m.image_url_main
  }));

  const secondaryMuscles: MuscleInfo[] = exercise.muscles_secondary.map(m => ({
    id: m.id,
    name: m.name,
    name_en: m.name_en,
    is_front: m.is_front,
    image_url_main: m.image_url_main
  }));

  // Extrair equipamentos com informações completas
  const equipment: EquipmentInfo[] = exercise.equipment.map(e => ({
    id: e.id,
    name: e.name
  }));

  // Buscar imagens e vídeos separadamente
  const [images, videos] = await Promise.all([
    fetchExerciseImages(exercise.id),
    fetchExerciseVideos(exercise.id)
  ]);

  // Extrair links de YouTube da descrição
  const youtubeLinks = extractYouTubeLinks(translation?.description || '');
  const allVideos = [...videos, ...youtubeLinks];

  return {
    name,
    description,
    instructions: description, // Para compatibilidade
    primaryMuscles,
    secondaryMuscles,
    equipment,
    category: exercise.category?.name || '',
    images,
    videos: allVideos
  };
}/**
 * Remove tags HTML de uma string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove tags HTML
    .replace(/&nbsp;/g, ' ') // Substitui &nbsp; por espaço
    .replace(/&[a-z]+;/gi, ' ') // Remove outras entidades HTML
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    .trim();
}

/**
 * Busca exercícios por categoria ou grupo muscular
 * @param category - Nome da categoria ou grupo muscular
 * @param limit - Número máximo de resultados
 * @returns Array de exercícios encontrados
 */
export async function searchExercisesByCategory(
  category: string,
  limit: number = 10
): Promise<ExerciseSearchResult[]> {
  try {
    if (!isWgerConfigured()) {
      return [];
    }

    const { apiUrl, token } = getWgerApiConfig();
    const url = `${apiUrl}api/v2/exerciseinfo/?limit=${limit * 2}`; // Buscar mais para filtrar

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const normalizedCategory = normalizeString(category);

    const filteredExercises = data.results
      .filter((exercise: WgerExercise) => {
        // Verificar se a categoria ou músculos correspondem
        const categoryMatch = normalizeString(exercise.category.name).includes(normalizedCategory);
        const muscleMatch = exercise.muscles.some(muscle =>
          normalizeString(muscle.name).includes(normalizedCategory) ||
          normalizeString(muscle.name_en || '').includes(normalizedCategory)
        );

        return categoryMatch || muscleMatch;
      })
      .slice(0, limit);

    // Processar exercícios de forma assíncrona
    const matchingExercises = await Promise.all(
      filteredExercises.map((exercise: WgerExercise) => formatExerciseData(exercise, 7))
    );

    return matchingExercises;
  } catch (error) {
    console.error('Erro ao buscar exercícios por categoria:', error);
    return [];
  }
}

// ========================================
// FUNCIONALIDADES DE SINCRONIZAÇÃO
// ========================================

/**
 * Tipos para sincronização com WGER
 */
export interface WgerRoutine {
  id?: number;
  name: string;
  description: string;
  start?: string;
  end?: string;
  fit_in_week?: boolean;
  is_template?: boolean;
  is_public?: boolean;
}

export interface WgerDay {
  id?: number;
  routine: number;
  day: number;
  description?: string;
}

export interface WgerSet {
  id?: number;
  day: number;
  exercise: number;
  sets: number;
  reps: number;
  weight?: number;
  comment?: string;
  order?: number;
}

export interface WgerWorkoutSession {
  id?: number;
  routine: number;
  date: string;
  impression?: number; // 1-10 scale
  notes?: string;
  time_start?: string;
  time_end?: string;
}

export interface WgerWorkoutLog {
  id?: number;
  session: number;
  exercise: number;
  repetitions: number;
  weight: number;
  date: string;
  comment?: string;
}

/**
 * Cria uma rotina no WGER
 */
export async function createWgerRoutine(routine: RotinaDeTreino): Promise<WgerRoutine | null> {
  try {
    if (!isWgerConfigured()) {
      return null;
    }

    const { apiUrl, token } = getWgerApiConfig();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const wgerRoutine: WgerRoutine = {
      name: `IronLog: ${routine.nome}`,
      description: `Rotina criada pelo IronLog com ${routine.exercicios.length} exercícios`,
      start: new Date().toISOString().split('T')[0], // Data atual
      fit_in_week: true,
      is_template: false,
      is_public: false
    };

    const response = await fetch(`${apiUrl}api/v2/routine/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(wgerRoutine)
    });

    if (!response.ok) {
      console.error('Erro ao criar rotina no WGER:', response.status, await response.text());
      return null;
    }

    const createdRoutine = await response.json();
    console.log('✅ Rotina criada no WGER:', createdRoutine.id);

    // Criar dia de treino para a rotina
    await createWgerDay(createdRoutine.id, routine);

    return createdRoutine;
  } catch (error) {
    console.error('Erro ao criar rotina no WGER:', error);
    return null;
  }
}

/**
 * Cria um dia de treino no WGER
 */
async function createWgerDay(routineId: number, routine: RotinaDeTreino): Promise<void> {
  try {
    const { apiUrl, token } = getWgerApiConfig();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const wgerDay: WgerDay = {
      routine: routineId,
      day: 1,
      description: `Dia 1 - ${routine.nome}`
    };

    const response = await fetch(`${apiUrl}api/v2/day/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(wgerDay)
    });

    if (!response.ok) {
      console.error('Erro ao criar dia no WGER:', response.status);
      return;
    }

    const createdDay = await response.json();
    console.log('✅ Dia criado no WGER:', createdDay.id);

    // Criar sets para cada exercício
    for (let i = 0; i < routine.exercicios.length; i++) {
      await createWgerSet(createdDay.id, routine.exercicios[i], i + 1);
    }
  } catch (error) {
    console.error('Erro ao criar dia no WGER:', error);
  }
}

/**
 * Cria um set de exercício no WGER
 */
async function createWgerSet(dayId: number, exercicio: ExercicioDeRotina, order: number): Promise<void> {
  try {
    const { apiUrl, token } = getWgerApiConfig();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    // Buscar o exercício no WGER pelo nome
    const wgerExercise = await findWgerExerciseByName(exercicio.nomeExercicio);

    if (!wgerExercise) {
      console.log(`⚠️ Exercício "${exercicio.nomeExercicio}" não encontrado no WGER`);
      return;
    }

    const wgerSet: WgerSet = {
      day: dayId,
      exercise: wgerExercise.id,
      sets: exercicio.seriesAlvo,
      reps: exercicio.repeticoesAlvo,
      weight: exercicio.pesoAlvo,
      comment: `Criado pelo IronLog`,
      order: order
    };

    const response = await fetch(`${apiUrl}api/v2/set/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(wgerSet)
    });

    if (!response.ok) {
      console.error('Erro ao criar set no WGER:', response.status);
      return;
    }

    const createdSet = await response.json();
    console.log(`✅ Set criado no WGER para ${exercicio.nomeExercicio}:`, createdSet.id);
  } catch (error) {
    console.error('Erro ao criar set no WGER:', error);
  }
}

/**
 * Busca um exercício no WGER pelo nome para obter o ID
 */
async function findWgerExerciseByName(exerciseName: string): Promise<{ id: number, name: string } | null> {
  try {
    const { apiUrl, token } = getWgerApiConfig();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    // Buscar no exerciseinfo
    const response = await fetch(`${apiUrl}api/v2/exerciseinfo/?limit=100`, { headers });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const exercise = findExerciseByName(data.results, exerciseName, 7);

    if (exercise) {
      return {
        id: exercise.id,
        name: exercise.translations[0]?.name || exerciseName
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar exercício no WGER:', error);
    return null;
  }
}

/**
 * Cria uma sessão de treino no WGER
 */
export async function createWgerWorkoutSession(
  routineId: number,
  session: SessaoDeTreino
): Promise<WgerWorkoutSession | null> {
  try {
    const { apiUrl, token } = getWgerApiConfig();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    const sessionDate = new Date(session.data);
    const wgerSession: WgerWorkoutSession = {
      routine: routineId,
      date: sessionDate.toISOString().split('T')[0],
      impression: 8, // Sempre positivo para treinos completos
      notes: `Sessão do IronLog - XP ganho: ${session.xpGanho}`,
      time_start: sessionDate.toISOString(),
      time_end: new Date(sessionDate.getTime() + session.duracao * 60000).toISOString()
    };

    const response = await fetch(`${apiUrl}api/v2/workoutsession/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(wgerSession)
    });

    if (!response.ok) {
      console.error('Erro ao criar sessão no WGER:', response.status, await response.text());
      return null;
    }

    const createdSession = await response.json();
    console.log('✅ Sessão criada no WGER:', createdSession.id);

    // Criar logs dos exercícios
    for (const exercicio of session.exercicios) {
      await createWgerWorkoutLogs(createdSession.id, exercicio, session.data);
    }

    return createdSession;
  } catch (error) {
    console.error('Erro ao criar sessão no WGER:', error);
    return null;
  }
}

/**
 * Cria logs de treino no WGER
 */
async function createWgerWorkoutLogs(
  sessionId: number,
  exercicio: ExercicioRegistrado,
  sessionDate: string
): Promise<void> {
  try {
    const { apiUrl, token } = getWgerApiConfig();

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    // Buscar o exercício no WGER
    const wgerExercise = await findWgerExerciseByName(exercicio.exercicioId);

    if (!wgerExercise) {
      console.log(`⚠️ Exercício "${exercicio.exercicioId}" não encontrado no WGER`);
      return;
    }

    // Criar um log para cada série completada
    for (const serie of exercicio.series) {
      if (serie.concluido && serie.peso > 0 && serie.reps > 0) {
        const wgerLog: WgerWorkoutLog = {
          session: sessionId,
          exercise: wgerExercise.id,
          repetitions: serie.reps,
          weight: serie.peso,
          date: sessionDate.split('T')[0],
          comment: 'IronLog'
        };

        const response = await fetch(`${apiUrl}api/v2/workoutlog/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(wgerLog)
        });

        if (response.ok) {
          const createdLog = await response.json();
          console.log(`✅ Log criado no WGER para ${exercicio.exercicioId}: ${serie.peso}kg x ${serie.reps}`);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao criar logs no WGER:', error);
  }
}

/**
 * Função principal para sincronizar uma rotina completa com o WGER
 */
export async function syncRoutineToWger(routine: RotinaDeTreino): Promise<{ success: boolean, routineId?: number }> {
  try {
    console.log(`🔄 Iniciando sincronização da rotina "${routine.nome}" com WGER...`);

    const wgerRoutine = await createWgerRoutine(routine);

    if (wgerRoutine) {
      console.log(`✅ Rotina "${routine.nome}" sincronizada com WGER (ID: ${wgerRoutine.id})`);
      return { success: true, routineId: wgerRoutine.id };
    } else {
      console.error(`❌ Falha ao sincronizar rotina "${routine.nome}" com WGER`);
      return { success: false };
    }
  } catch (error) {
    console.error('Erro na sincronização com WGER:', error);
    return { success: false };
  }
}

/**
 * Função principal para sincronizar uma sessão de treino com o WGER
 */
export async function syncSessionToWger(
  session: SessaoDeTreino,
  wgerRoutineId?: number
): Promise<{ success: boolean, sessionId?: number }> {
  try {
    if (!wgerRoutineId) {
      console.log('⚠️ ID da rotina no WGER não fornecido, pulando sincronização da sessão');
      return { success: false };
    }

    console.log(`🔄 Sincronizando sessão de treino com WGER...`);

    const wgerSession = await createWgerWorkoutSession(wgerRoutineId, session);

    if (wgerSession) {
      console.log(`✅ Sessão sincronizada com WGER (ID: ${wgerSession.id})`);
      return { success: true, sessionId: wgerSession.id };
    } else {
      console.error('❌ Falha ao sincronizar sessão com WGER');
      return { success: false };
    }
  } catch (error) {
    console.error('Erro na sincronização da sessão com WGER:', error);
    return { success: false };
  }
}
/**
 * @fileOverview Integração com a API do WGER para dados de exercícios.
 * Este arquivo contém as funções para buscar informações de exercícios,
 * instruções e imagens da API do WGER.
 */

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
  }>;
  muscles_secondary: Array<{
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
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

export interface ExerciseSearchResult {
  name: string;
  description: string;
  instructions: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
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
    const apiUrl = process.env.WGER_API_URL || 'https://fit.advansoftware.shop/';
    const apiToken = process.env.WGER_API_TOKEN;
    const url = `${apiUrl}api/v2/exerciseinfo/?limit=50`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (apiToken) {
      headers['Authorization'] = `Token ${apiToken}`;
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

    const result = formatExerciseData(exercise, language);

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
    const apiUrl = process.env.WGER_API_URL || 'https://fit.advansoftware.shop/';
    const apiToken = process.env.WGER_API_TOKEN;
    const url = `${apiUrl}api/v2/exerciseinfo/${exerciseId}/`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (apiToken) {
      headers['Authorization'] = `Token ${apiToken}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error('Erro ao buscar exercício por ID:', response.status);
      return null;
    }

    const exercise: WgerExercise = await response.json();
    const result = formatExerciseData(exercise, language);

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
 * Formata os dados do exercício para o formato usado na aplicação
 */
function formatExerciseData(exercise: WgerExercise, language: number): ExerciseSearchResult {
  // Buscar tradução no idioma preferido (português = 7), depois inglês (2), depois alemão (1)
  const translation = exercise.translations.find(t => t.language === language) ||
    exercise.translations.find(t => t.language === 7) || // português como fallback
    exercise.translations.find(t => t.language === 2) || // inglês como segundo fallback
    exercise.translations[0];

  const name = translation?.name || 'Exercício sem nome';
  const description = translation?.description ?
    stripHtml(translation.description) :
    'Descrição não disponível';

  // Extrair músculos primários e secundários (preferir nome em inglês para tradução posterior)
  const primaryMuscles = exercise.muscles.map(m => m.name_en || m.name).filter(Boolean);
  const secondaryMuscles = exercise.muscles_secondary.map(m => m.name_en || m.name).filter(Boolean);

  // Extrair equipamentos
  const equipment = exercise.equipment.map(e => e.name);

  // Processar imagens (adicionar URL base se necessário)
  const apiUrl = process.env.WGER_API_URL || 'https://fit.advansoftware.shop/';
  const images = exercise.images?.map(img => {
    return img.image.startsWith('http') ? img.image : `${apiUrl}${img.image}`;
  }) || [];

  // Processar vídeos
  const videos = exercise.videos?.map(video => {
    return video.video.startsWith('http') ? video.video : `${apiUrl}${video.video}`;
  }) || [];

  return {
    name,
    description,
    instructions: description, // Para compatibilidade
    primaryMuscles,
    secondaryMuscles,
    equipment,
    images,
    videos
  };
}

/**
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
    const apiUrl = process.env.WGER_API_URL || 'https://fit.advansoftware.shop/';
    const apiToken = process.env.WGER_API_TOKEN;
    const url = `${apiUrl}api/v2/exerciseinfo/?limit=${limit * 2}`; // Buscar mais para filtrar

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (apiToken) {
      headers['Authorization'] = `Token ${apiToken}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const normalizedCategory = normalizeString(category);

    const matchingExercises = data.results
      .filter((exercise: WgerExercise) => {
        // Verificar se a categoria ou músculos correspondem
        const categoryMatch = normalizeString(exercise.category.name).includes(normalizedCategory);
        const muscleMatch = exercise.muscles.some(muscle =>
          normalizeString(muscle.name).includes(normalizedCategory) ||
          normalizeString(muscle.name_en || '').includes(normalizedCategory)
        );

        return categoryMatch || muscleMatch;
      })
      .slice(0, limit)
      .map((exercise: WgerExercise) => formatExerciseData(exercise, 7));

    return matchingExercises;
  } catch (error) {
    console.error('Erro ao buscar exercícios por categoria:', error);
    return [];
  }
}
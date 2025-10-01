/**
 * @fileOverview Componente para exibir informações detalhadas dos exercícios.
 * Integra com a API do WGER para mostrar instruções, músculos trabalhados e equipamentos.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Activity, Dumbbell, Target } from "lucide-react";
import {
  ExerciseSearchResult,
  MuscleInfo,
  EquipmentInfo,
} from "@/lib/wger-api";

interface ExerciseInfoDialogProps {
  exerciseName: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Componente que exibe informações detalhadas do exercício em um modal
 */
export function ExerciseInfoDialog({
  exerciseName,
  children,
  className = "",
}: ExerciseInfoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseSearchResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = async () => {
    if (!exerciseData && !isLoading) {
      setIsLoading(true);
      setError(null);

      try {
        // Importação dinâmica para evitar problemas de SSR
        const { searchExerciseByName, isWgerConfigured } = await import(
          "@/lib/wger-api"
        );

        // Verificar se WGER está configurado
        if (!isWgerConfigured()) {
          setError(
            "Integração WGER não configurada. Vá em Configurações para configurar sua conta WGER e ver informações detalhadas dos exercícios."
          );
          return;
        }

        const data = await searchExerciseByName(exerciseName, 7); // Forçar português

        if (data) {
          setExerciseData(data);
        } else {
          setError(
            "Informações não encontradas para este exercício. Tente verificar se o nome está correto ou se o exercício existe na base de dados do WGER."
          );
        }
      } catch (err) {
        console.error("Erro ao buscar informações do exercício:", err);
        setError(
          "Erro ao carregar informações do exercício. Verifique sua conexão com a internet e as configurações do WGER."
        );
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          onClick={handleOpenDialog}
          className={`text-left hover:text-primary transition-colors ${className}`}
        >
          {children || (
            <div className="flex items-center gap-1">
              <span className="truncate">{exerciseName}</span>
              <Info className="size-3 flex-shrink-0 opacity-50" />
            </div>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="size-5" />
            {exerciseData?.name || exerciseName}
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre como executar o exercício
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="size-8 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          )}

          {exerciseData && (
            <div className="space-y-6">
              {/* Descrição/Instruções */}
              {exerciseData.description && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="size-4" />
                    Como Executar
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exerciseData.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Categoria do Exercício */}
              {exerciseData.category && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    📂 Categoria
                  </h4>
                  <Badge variant="outline" className="text-sm font-medium">
                    {translateCategory(exerciseData.category)}
                  </Badge>
                </div>
              )}

              {/* Músculos Primários com Imagens */}
              {exerciseData.primaryMuscles.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="size-4" />
                    Músculos Principais
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exerciseData.primaryMuscles.map((muscle, index) => (
                      <div
                        key={muscle.id}
                        className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border"
                      >
                        {muscle.image_url_main && (
                          <div className="flex-shrink-0">
                            <img
                              src={muscle.image_url_main}
                              alt={`Diagrama do músculo ${muscle.name}`}
                              className="w-12 h-12 object-contain rounded border bg-white"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {translateMuscle(muscle.name_en || muscle.name)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {muscle.is_front ? "Frontal" : "Posterior"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Músculos Secundários com Imagens */}
              {exerciseData.secondaryMuscles.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="size-4 opacity-70" />
                    Músculos Secundários
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exerciseData.secondaryMuscles.map((muscle, index) => (
                      <div
                        key={muscle.id}
                        className="flex items-center gap-3 p-3 bg-secondary/5 rounded-lg border"
                      >
                        {muscle.image_url_main && (
                          <div className="flex-shrink-0">
                            <img
                              src={muscle.image_url_main}
                              alt={`Diagrama do músculo ${muscle.name}`}
                              className="w-12 h-12 object-contain rounded border bg-white"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {translateMuscle(muscle.name_en || muscle.name)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {muscle.is_front ? "Frontal" : "Posterior"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipamentos */}
              {exerciseData.equipment.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Dumbbell className="size-4" />
                    Equipamentos Necessários
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exerciseData.equipment.map((equipment, index) => (
                      <Badge
                        key={equipment.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {translateEquipment(equipment.name)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Vídeos de demonstração */}
              {exerciseData.videos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    📺 Vídeos de Demonstração
                  </h4>
                  <div className="space-y-3">
                    {exerciseData.videos.map((video, index) => {
                      // Detectar se é YouTube para criar embed
                      const youtubeMatch = video.match(
                        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                      );
                      if (youtubeMatch) {
                        const videoId = youtubeMatch[1];
                        return (
                          <div key={index} className="aspect-video w-full">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={`Demonstração ${
                                exerciseData.name
                              } - Vídeo ${index + 1}`}
                              className="w-full h-full rounded-lg border"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        );
                      } else {
                        // Para outros tipos de vídeo, mostrar link
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                          >
                            <span className="text-2xl">🎥</span>
                            <a
                              href={video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex-1 truncate"
                            >
                              Ver vídeo de demonstração
                            </a>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}

              {exerciseData.videos.length > 0 &&
                exerciseData.images.length > 0 && <Separator />}

              {/* Imagens */}
              {exerciseData.images.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    📷 Imagens de Demonstração
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {exerciseData.images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Demonstração do ${exerciseData.name} - ${
                          index + 1
                        }`}
                        className="rounded-lg border w-full h-32 object-cover bg-muted"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : exerciseData.videos.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">
                    📷 Nenhuma imagem ou vídeo disponível para este exercício na
                    base de dados WGER.
                  </p>
                  <p className="text-xs mt-1">
                    Consulte um profissional ou procure vídeos online para ver a
                    execução correta.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Traduz nomes de músculos do inglês para português
 */
function translateMuscle(muscle: string): string {
  const translations: { [key: string]: string } = {
    // Músculos principais
    Chest: "Peito",
    "Pectoralis major": "Peitoral Maior",
    Shoulders: "Ombros",
    "Anterior deltoid": "Deltóide Anterior",
    "Posterior deltoid": "Deltóide Posterior",
    Deltoid: "Deltóide",
    Biceps: "Bíceps",
    "Biceps brachii": "Bíceps Braquial",
    Triceps: "Tríceps",
    "Triceps brachii": "Tríceps Braquial",
    Quads: "Quadríceps",
    "Quadriceps femoris": "Quadríceps Femoral",
    Hamstrings: "Posteriores da Coxa",
    "Biceps femoris": "Bíceps Femoral",
    Glutes: "Glúteos",
    "Gluteus maximus": "Glúteo Máximo",
    Lats: "Dorsais",
    "Latissimus dorsi": "Grande Dorsal",
    Abs: "Abdômen",
    "Rectus abdominis": "Reto Abdominal",
    "Obliquus externus abdominis": "Oblíquo Externo",
    Calves: "Panturrilhas",
    Gastrocnemius: "Gastrocnêmio",
    Soleus: "Sóleo",
    Forearms: "Antebraços",
    Traps: "Trapézio",
    Trapezius: "Trapézio",
    "Lower Back": "Lombar",
    "Erector spinae": "Eretor da Espinha",
    "Serratus anterior": "Serrátil Anterior",
    Rhomboid: "Rombóide",
    "Middle deltoid": "Deltóide Médio",
    Brachialis: "Braquial",
    Brachioradialis: "Braquiorradial",
  };

  return translations[muscle] || muscle;
}

/**
 * Traduz nomes de equipamentos do inglês para português
 */
function translateEquipment(equipment: string): string {
  const translations: { [key: string]: string } = {
    Barbell: "Barra Olímpica",
    Dumbbell: "Halteres",
    Kettlebell: "Kettlebell",
    Bench: "Banco",
    "Gym mat": "Colchonete",
    "none (bodyweight exercise)": "Peso Corporal",
    Cable: "Cabos e Polias",
    Machine: "Máquina",
    "Pull-up bar": "Barra Fixa",
    "Incline bench": "Banco Inclinado",
    "Decline bench": "Banco Declinado",
    "Preacher bench": "Banco Scott",
    "Swiss Ball": "Bola Suíça",
    "Medicine Ball": "Medicine Ball",
    "Resistance Band": "Faixa Elástica",
    TRX: "TRX",
    "Suspension trainer": "Fitas de Suspensão",
    "Smith machine": "Máquina Smith",
    "Power rack": "Power Rack",
    "Leg press": "Leg Press",
    "Lat pulldown": "Puxador Alto",
    "Cable machine": "Aparelho de Cabo",
    "Rowing machine": "Aparelho de Remada",
    "Leg curl machine": "Máquina Flexora",
    "Leg extension machine": "Máquina Extensora",
    "Calf raise machine": "Máquina Panturrilha",
    "Hyperextension bench": "Banco de Hiperextensão",
    "Roman chair": "Cadeira Romana",
    "Dip station": "Barras Paralelas",
    "Ez-bar": "Barra W",
    "Olympic barbell": "Barra Olímpica",
    "Straight bar": "Barra Reta",
  };

  return translations[equipment] || equipment;
}

/**
 * Traduz categorias de exercícios para português
 */
function translateCategory(category: string): string {
  const translations: { [key: string]: string } = {
    Arms: "Braços",
    Legs: "Pernas",
    Abs: "Abdômen",
    Chest: "Peito",
    Back: "Costas",
    Shoulders: "Ombros",
    Calves: "Panturrilhas",
    Cardio: "Cardio",
    Stretching: "Alongamento",
    Core: "Core",
    "Full Body": "Corpo Inteiro",
    Functional: "Funcional",
  };

  return translations[category] || category;
}

/**
 * Hook para usar informações de exercício
 */
export function useExerciseInfo(exerciseName: string) {
  const [data, setData] = useState<ExerciseSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExerciseInfo = async () => {
    if (data || isLoading) return data;

    setIsLoading(true);
    setError(null);

    try {
      const { searchExerciseByName } = await import("@/lib/wger-api");
      const result = await searchExerciseByName(exerciseName);
      setData(result);
      return result;
    } catch (err) {
      console.error("Erro ao buscar exercício:", err);
      setError("Erro ao carregar informações");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchExerciseInfo };
}

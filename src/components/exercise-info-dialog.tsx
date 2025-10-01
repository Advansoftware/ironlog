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
import { ExerciseSearchResult } from "@/lib/wger-api";

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
        const { searchExerciseByName } = await import("@/lib/wger-api");
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
          "Erro ao carregar informações do exercício. Verifique sua conexão com a internet."
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

              {/* Músculos Primários */}
              {exerciseData.primaryMuscles.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="size-4" />
                    Músculos Principais
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exerciseData.primaryMuscles.map((muscle, index) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {translateMuscle(muscle)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Músculos Secundários */}
              {exerciseData.secondaryMuscles.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="size-4 opacity-70" />
                    Músculos Secundários
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exerciseData.secondaryMuscles.map((muscle, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {translateMuscle(muscle)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipamentos */}
              {exerciseData.equipment.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Dumbbell className="size-4" />
                    Equipamentos
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exerciseData.equipment.map((equipment, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {translateEquipment(equipment)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Imagens */}
              {exerciseData.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Demonstração</h4>
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
              )}
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

/**
 * @fileOverview Componente para exibir card detalhado de exercício com integração WGER
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Activity, Dumbbell, Target, Info, ImageIcon } from "lucide-react";
import { ExerciseSearchResult } from "@/lib/wger-api";
import type { Exercicio } from "@/lib/types";

interface ExerciseCardProps {
  exercise: Exercicio;
  className?: string;
}

/**
 * Card de exercício com integração ao WGER para mostrar detalhes completos
 */
export function ExerciseCard({ exercise, className = "" }: ExerciseCardProps) {
  const [wgerData, setWgerData] = useState<ExerciseSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExerciseData = async () => {
    if (wgerData || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { searchExerciseByName, isWgerConfigured } = await import(
        "@/lib/wger-api"
      );

      // Verificar se WGER está configurado
      if (!isWgerConfigured()) {
        setError(
          "Configure WGER nas Configurações para ver detalhes dos exercícios."
        );
        return;
      }

      const data = await searchExerciseByName(exercise.nome, 7);

      if (data) {
        setWgerData(data);
      } else {
        // Tentar buscar com variações do nome
        const variations = [
          exercise.nome.toLowerCase(),
          exercise.nome.replace(/\s+/g, " ").trim(),
          // Adicionar traduções comuns
          exercise.nome === "Supino" ? "bench press" : exercise.nome,
          exercise.nome === "Agachamento" ? "squat" : exercise.nome,
          exercise.nome === "Levantamento Terra" ? "deadlift" : exercise.nome,
        ];

        for (const variation of variations) {
          const result = await searchExerciseByName(variation, 7);
          if (result) {
            setWgerData(result);
            break;
          }
        }

        if (!wgerData) {
          setError("Detalhes não disponíveis para este exercício no WGER.");
        }
      }
    } catch (err) {
      console.error("Erro ao buscar dados do WGER:", err);
      setError(
        "Erro ao carregar detalhes do exercício. Verifique as configurações do WGER."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    setIsOpen(true);
    fetchExerciseData();
  };

  return (
    <>
      <Card
        className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>{exercise.nome}</span>
            <Target className="size-4 text-muted-foreground" />
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Activity className="size-3" />
            {exercise.grupoMuscular}
            {exercise.equipamento && (
              <>
                <span className="text-muted-foreground">•</span>
                <Dumbbell className="size-3" />
                {exercise.equipamento}
              </>
            )}
          </CardDescription>
        </CardHeader>

        {/* Preview da imagem se disponível */}
        {wgerData?.images && wgerData.images.length > 0 && (
          <CardContent className="pt-0">
            <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
              <img
                src={wgerData.images[0]}
                alt={`Demonstração do ${exercise.nome}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal com detalhes completos */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="size-5" />
              {wgerData?.name || exercise.nome}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-4">Carregando detalhes...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="size-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">{error}</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Exercício:</strong> {exercise.nome}
                  </p>
                  <p>
                    <strong>Grupo Muscular:</strong> {exercise.grupoMuscular}
                  </p>
                  {exercise.equipamento && (
                    <p>
                      <strong>Equipamento:</strong> {exercise.equipamento}
                    </p>
                  )}
                </div>
              </div>
            )}

            {wgerData && (
              <div className="space-y-6">
                {/* Imagens do exercício */}
                {wgerData.images && wgerData.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon className="size-4" />
                      Demonstração Visual
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wgerData.images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-video bg-muted rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${wgerData.name} - Demonstração ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Instruções */}
                {wgerData.description && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Info className="size-4" />
                      Como Executar
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {wgerData.description}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Músculos Principais */}
                  {wgerData.primaryMuscles &&
                    wgerData.primaryMuscles.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Activity className="size-4" />
                          Músculos Principais
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {wgerData.primaryMuscles.map((muscle, index) => (
                            <Badge
                              key={index}
                              variant="default"
                              className="text-xs"
                            >
                              {translateMuscle(muscle.name_en || muscle.name)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Músculos Secundários */}
                  {wgerData.secondaryMuscles &&
                    wgerData.secondaryMuscles.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Activity className="size-4 opacity-70" />
                          Músculos Secundários
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {wgerData.secondaryMuscles.map((muscle, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {translateMuscle(muscle.name_en || muscle.name)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Equipamentos */}
                {wgerData.equipment && wgerData.equipment.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Dumbbell className="size-4" />
                      Equipamentos Necessários
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {wgerData.equipment.map((equipment, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {translateEquipment(equipment.name)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informações adicionais do exercício local */}
                <Separator />
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Informações Locais</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Grupo Muscular:</span>
                      <p className="text-muted-foreground">
                        {exercise.grupoMuscular}
                      </p>
                    </div>
                    {exercise.equipamento && (
                      <div>
                        <span className="font-medium">Equipamento:</span>
                        <p className="text-muted-foreground">
                          {exercise.equipamento}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Traduz nomes de músculos do inglês para português
 */
function translateMuscle(muscle: string): string {
  const translations: { [key: string]: string } = {
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

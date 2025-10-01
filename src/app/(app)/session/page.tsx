"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExerciseInfoDialog } from "@/components/exercise-info-dialog";
import {
  getRotinas,
  getNomeExercicio,
  salvarSessao,
  getRecordesPessoais,
} from "@/lib/storage";
import {
  Check,
  Dumbbell,
  X,
  PartyPopper,
  Zap,
  Circle,
  Info,
} from "lucide-react";
import type {
  RotinaDeTreino,
  SerieRegistrada,
  ExercicioRegistrado,
  RecordePessoal,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { levelData } from "@/lib/gamification";
import { cn } from "@/lib/utils";

type SerieState = SerieRegistrada & { id: number };

function SessionContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routineId");

  const [routine, setRoutine] = useState<RotinaDeTreino | null | undefined>(
    undefined
  );
  const [sessionSets, setSessionSets] = useState<Record<string, SerieState[]>>(
    {}
  );
  const startTime = useRef(new Date());

  useEffect(() => {
    const rotinas = getRotinas();
    const foundRoutine = rotinas.find((r) => r.id === routineId) || rotinas[0];
    setRoutine(foundRoutine || null);

    if (foundRoutine) {
      const initialSets: Record<string, SerieState[]> = {};
      foundRoutine.exercicios.forEach((ex) => {
        initialSets[ex.exercicioId] = Array.from(
          { length: ex.seriesAlvo },
          (_, i) => ({
            id: i,
            reps: ex.repeticoesAlvo,
            peso: ex.pesoAlvo || 0,
            concluido: false,
          })
        );
      });
      setSessionSets(initialSets);
    }
  }, [routineId]);

  const handleSetChange = (
    exercicioId: string,
    setId: number,
    field: "reps" | "peso" | "concluido",
    value: number | boolean
  ) => {
    setSessionSets((prev) => {
      const newSets = [...(prev[exercicioId] || [])];
      const setIndex = newSets.findIndex((s) => s.id === setId);
      if (setIndex !== -1) {
        const updatedSet = { ...newSets[setIndex], [field]: value };
        newSets[setIndex] = updatedSet;
      }
      return { ...prev, [exercicioId]: newSets };
    });
  };

  const handleAddSet = (exercicioId: string) => {
    setSessionSets((prev) => {
      const newSets = [...(prev[exercicioId] || [])];
      const lastSet = newSets[newSets.length - 1];
      newSets.push({
        id: newSets.length,
        reps: lastSet?.reps || 8,
        peso: lastSet?.peso || 10,
        concluido: false,
      });
      return { ...prev, [exercicioId]: newSets };
    });
  };

  const handleFinishSession = async () => {
    if (!routine) return;

    const endTime = new Date();
    const duracao = Math.round(
      (endTime.getTime() - startTime.current.getTime()) / (1000 * 60)
    );

    const exercicios: ExercicioRegistrado[] = Object.entries(sessionSets)
      .map(([exercicioId, series]) => ({
        exercicioId,
        series: series
          .filter((s) => s.concluido)
          .map(({ id, ...rest }) => rest),
      }))
      .filter((ex) => ex.series.length > 0);

    if (exercicios.length === 0) {
      toast({
        variant: "destructive",
        title: "Treino Vazio",
        description: "Conclua ao menos uma série para salvar a sessão.",
      });
      return;
    }

    const novaSessao = {
      rotinaId: routine.id,
      nome: routine.nome,
      data: new Date().toISOString(),
      exercicios,
      duracao,
    };

    const recordesPessoaisAtuais = getRecordesPessoais();
    const novosRecordes: RecordePessoal[] = [];

    exercicios.forEach((ex) => {
      const recordeAtual = recordesPessoaisAtuais.find(
        (pr) => pr.exercicioId === ex.exercicioId
      );
      const melhorSet = ex.series.reduce(
        (melhor, atual) => (atual.peso > melhor.peso ? atual : melhor),
        { peso: 0, reps: 0, concluido: false }
      );

      if (!recordeAtual || melhorSet.peso > recordeAtual.peso) {
        novosRecordes.push({
          exercicioId: ex.exercicioId,
          peso: melhorSet.peso,
          reps: melhorSet.reps,
          data: new Date().toISOString(),
        });
      }
    });

    try {
      const { levelUpInfo, xpGanho } = await salvarSessao(
        novaSessao,
        novosRecordes
      );

      toast({
        title: "Treino Finalizado!",
        description: `Bom trabalho! Você ganhou ${xpGanho.toLocaleString(
          "pt-BR"
        )} XP e foi sincronizado com WGER.`,
      });

      if (levelUpInfo.didLevelUp) {
        toast({
          title: "BIIIRL! Subiu de Nível!",
          description: `Você alcançou o Nível ${levelUpInfo.newLevel}: ${
            levelData[levelUpInfo.newLevel].name
          }`,
          duration: 5000,
          action: <Zap className="text-yellow-400" />,
        });
      }

      if (novosRecordes.length > 0) {
        toast({
          title: "Novo Recorde Pessoal!",
          description: `Você quebrou ${novosRecordes.length} recorde(s)!`,
          duration: 5000,
          action: <PartyPopper className="text-yellow-400" />,
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao finalizar sessão:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Finalizar Treino",
        description: "Houve um problema ao salvar a sessão. Tente novamente.",
      });
    }
  };

  const handleCancelSession = () => {
    router.back();
  };

  if (routine === undefined) {
    return <div className="text-center p-8">Carregando rotina...</div>;
  }

  if (!routine) {
    return (
      <>
        <PageHeader
          title="Nenhuma Rotina Encontrada"
          description="Crie uma rotina para começar."
        />
        <div className="text-center text-muted-foreground">
          <p>Parece que você não tem nenhuma rotina de treino ainda.</p>
          <Button asChild className="mt-4">
            <a href="/routines/create">Criar Rotina com IA</a>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={routine.nome}
        description="Registre sua sessão de treino."
      >
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="w-1/2 md:w-auto"
            onClick={handleCancelSession}
          >
            <X className="mr-2 size-4" />
            Cancelar
          </Button>
          <Button className="w-1/2 md:w-auto" onClick={handleFinishSession}>
            <Check className="mr-2 size-4" />
            Finalizar
          </Button>
        </div>
      </PageHeader>

      <div className="space-y-6 pb-24">
        {routine.exercicios.map((exercise) => {
          const exerciseInfo = getNomeExercicio(exercise.exercicioId);
          return (
            <Card key={exercise.exercicioId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="size-5 text-primary" />
                      {exerciseInfo}
                    </CardTitle>
                    <CardDescription>
                      Meta: {exercise.seriesAlvo} séries de{" "}
                      {exercise.repeticoesAlvo} reps
                    </CardDescription>
                  </div>
                  <ExerciseInfoDialog exerciseName={exerciseInfo} asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Info className="size-4" />
                      Como Fazer
                    </Button>
                  </ExerciseInfoDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-4 text-xs text-muted-foreground font-medium">
                  <span className="invisible px-2">Série</span>
                  <Label>Peso (kg)</Label>
                  <Label>Reps</Label>
                  <span className="text-center">Feito</span>
                </div>

                {(sessionSets[exercise.exercicioId] || []).map((set, i) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2 sm:gap-x-4"
                  >
                    <span className="font-bold text-lg text-foreground px-2">
                      {i + 1}
                    </span>
                    <Input
                      type="number"
                      placeholder="kg"
                      value={set.peso}
                      onChange={(e) =>
                        handleSetChange(
                          exercise.exercicioId,
                          set.id,
                          "peso",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) =>
                        handleSetChange(
                          exercise.exercicioId,
                          set.id,
                          "reps",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <Button
                      variant={set.concluido ? "default" : "ghost"}
                      size="icon"
                      className={cn(
                        "rounded-full h-10 w-10 justify-self-center"
                      )}
                      onClick={() =>
                        handleSetChange(
                          exercise.exercicioId,
                          set.id,
                          "concluido",
                          !set.concluido
                        )
                      }
                    >
                      {set.concluido ? (
                        <Check className="size-5" />
                      ) : (
                        <Circle className="size-5" />
                      )}
                      <span className="sr-only">
                        Marcar série como concluída
                      </span>
                    </Button>
                  </div>
                ))}

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleAddSet(exercise.exercicioId)}
                >
                  Adicionar Série
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Carregando...</div>}>
      <SessionContent />
    </Suspense>
  );
}

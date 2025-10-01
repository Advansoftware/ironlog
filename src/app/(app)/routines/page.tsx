"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Icons } from "@/components/icons";
import { ExerciseInfoDialog } from "@/components/exercise-info-dialog";
import { getRotinas, deletarRotina } from "@/lib/storage";
import { useEffect, useState } from "react";
import type { RotinaDeTreino } from "@/lib/types";
import { Sparkles, Trash2, MoreVertical, Pencil, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

function RoutineSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="flex-grow space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Skeleton className="size-3 flex-shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function RoutinesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rotinas, setRotinas] = useState<RotinaDeTreino[]>([]);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setRotinas(getRotinas());
    setIsLoading(false);
  }, []);

  const handleDeleteRoutine = (id: string) => {
    deletarRotina(id);
    setRotinas(getRotinas());
    setOpenDialogId(null);
  };

  return (
    <>
      <PageHeader
        title="Suas Rotinas de Treino"
        description="Aqui ficam seus planos de treino. Comece uma sessão a partir de uma rotina existente ou crie uma nova."
      >
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/routines/create">
              <Sparkles className="mr-2" />
              Criar com IA
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/routines/create/manual">
              <Plus className="mr-2" />
              Criar Manualmente
            </Link>
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <RoutineSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
          {rotinas.map((routine) => (
            <Card key={routine.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{routine.nome}</CardTitle>
                  <CardDescription>
                    {routine.exercicios.length} exercícios
                  </CardDescription>
                </div>
                <AlertDialog
                  open={openDialogId === routine.id}
                  onOpenChange={(open) => !open && setOpenDialogId(null)}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/routines/create/manual?editId=${routine.id}`}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setOpenDialogId(routine.id);
                          }}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Deletar</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso deletará
                        permanentemente sua rotina.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="text-sm text-muted-foreground space-y-2">
                  {routine.exercicios.slice(0, 4).map((ex) => (
                    <li
                      key={ex.exercicioId}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icons.Exercises className="size-3 flex-shrink-0" />
                        <ExerciseInfoDialog
                          exerciseName={ex.nomeExercicio}
                          className="truncate"
                        >
                          <span className="truncate hover:text-primary cursor-pointer transition-colors">
                            {ex.nomeExercicio}
                          </span>
                        </ExerciseInfoDialog>
                      </div>
                      <span className="font-mono text-xs text-foreground/80 flex-shrink-0">
                        {ex.seriesAlvo}x{ex.repeticoesAlvo}
                      </span>
                    </li>
                  ))}
                  {routine.exercicios.length > 4 && (
                    <li className="text-xs pt-1">
                      e mais {routine.exercicios.length - 4}...
                    </li>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/session?routineId=${routine.id}`}>
                    <Icons.Zap />
                    Iniciar Treino
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {rotinas.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhuma rotina criada ainda. Crie uma com IA ou manualmente.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/routines/create">
                    <Sparkles className="mr-2" />
                    Criar com IA
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/routines/create/manual">
                    <Plus className="mr-2" />
                    Criar Manualmente
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Icons } from '@/components/icons';
import { getRotinas } from '@/lib/storage';
import { useEffect, useState } from 'react';
import type { RotinaDeTreino } from '@/lib/types';
import { Sparkles, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function RoutinesPage() {
  const [rotinas, setRotinas] = useState<RotinaDeTreino[]>([]);

  useEffect(() => {
    setRotinas(getRotinas());
  }, []);

  const handleDeleteRoutine = (id: string) => {
    const rotinasAtuais = getRotinas();
    const novasRotinas = rotinasAtuais.filter(r => r.id !== id);
    localStorage.setItem('rotinas', JSON.stringify(novasRotinas));
    setRotinas(novasRotinas);
  }

  return (
    <>
      <PageHeader title="Rotinas" description="Gerencie suas rotinas ou crie uma nova com IA.">
        <Button asChild>
          <Link href="/routines/create">
            <Sparkles className="mr-2" />
            Criar com IA
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
        {rotinas.map((routine) => (
          <Card key={routine.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{routine.nome}</CardTitle>
                <CardDescription>{routine.exercicios.length} exercícios</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Deletar</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso deletará permanentemente sua rotina.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteRoutine(routine.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="text-sm text-muted-foreground space-y-2">
                 {routine.exercicios.slice(0, 4).map(ex => (
                    <li key={ex.exercicioId} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <Icons.Exercises className="size-3 flex-shrink-0" />
                          <span className="truncate">{ex.nomeExercicio}</span>
                        </div>
                        <span className="font-mono text-xs text-foreground/80 flex-shrink-0">{ex.seriesAlvo}x{ex.repeticoesAlvo}</span>
                    </li>
                 ))}
                 {routine.exercicios.length > 4 && <li className="text-xs pt-1">e mais {routine.exercicios.length - 4}...</li>}
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
              Nenhuma rotina criada ainda. Que tal criar uma com a ajuda da IA?
            </p>
             <Button asChild>
              <Link href="/routines/create">
                <Sparkles className="mr-2" />
                Criar minha primeira rotina
              </Link>
            </Button>
          </div>
        )}
      </div>

    </>
  );
}

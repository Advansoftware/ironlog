
'use client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { getBibliotecaDeExercicios, gruposMusculares, salvarExercicio } from '@/lib/storage';
import { Weight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Exercicio, GrupoMuscular } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

function ExerciseSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

const addExerciseSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  grupoMuscular: z.enum(gruposMusculares, { required_error: "Selecione um grupo muscular."}),
});

type AddExerciseFormValues = z.infer<typeof addExerciseSchema>;

export default function ExercisesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [biblioteca, setBiblioteca] = useState<Exercicio[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AddExerciseFormValues>({
    resolver: zodResolver(addExerciseSchema),
    defaultValues: {
      nome: "",
    },
  });

  const updateLibrary = () => {
    setBiblioteca(getBibliotecaDeExercicios());
  }

  useEffect(() => {
    setIsLoading(true);
    updateLibrary();
    setIsLoading(false);
  }, []);
  
  const onSubmit = (values: AddExerciseFormValues) => {
    salvarExercicio({ ...values, equipamento: 'Personalizado' });
    toast({
      title: "Exercício Adicionado!",
      description: `"${values.nome}" foi salvo na sua biblioteca.`,
    });
    updateLibrary();
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Biblioteca de Exercícios"
        description="Navegue pelos exercícios ou adicione os seus próprios."
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
                <Plus className="mr-2"/>
                Adicionar Exercício
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Exercício Personalizado</DialogTitle>
              <DialogDescription>
                Crie um novo exercício para usar em suas rotinas.
              </DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nome do Exercício</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Rosca 21" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="grupoMuscular"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Grupo Muscular</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um grupo" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {gruposMusculares.map(group => (
                                        <SelectItem key={group} value={group}>{group}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Salvar Exercício</Button>
                    </DialogFooter>
                </form>
            </Form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Tabs defaultValue={gruposMusculares[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-4 h-auto">
          {gruposMusculares.map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {gruposMusculares.map((group) => (
          <TabsContent key={group} value={group} className="mt-4">
            {isLoading ? <ExerciseSkeleton /> : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {biblioteca
                    .filter((ex) => ex.grupoMuscular === group)
                    .map((exercise) => (
                    <Card key={exercise.id}>
                        <CardHeader>
                            <CardTitle className="text-base font-medium">
                                {exercise.nome}
                            </CardTitle>
                             <CardDescription className="flex items-center gap-1 text-xs pt-1">
                                <Weight className="h-3 w-3" />
                                {exercise.equipamento || "Não especificado"}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    ))}
                </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

    
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getBibliotecaDeExercicios, getRotinas, salvarRotina, atualizarRotina } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { Exercicio, RotinaDeTreino } from '@/lib/types';


const exercicioSchema = z.object({
  exercicioId: z.string().min(1, "Selecione um exercício."),
  nomeExercicio: z.string(), // Será preenchido automaticamente
  seriesAlvo: z.coerce.number().min(1, "Mínimo de 1 série."),
  repeticoesAlvo: z.coerce.number().min(1, "Mínimo de 1 repetição."),
});

const formSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, "O nome da rotina precisa ter pelo menos 3 caracteres."),
  exercicios: z.array(exercicioSchema).min(1, "Adicione pelo menos um exercício à rotina."),
});

type FormValues = z.infer<typeof formSchema>;

function ManualCreateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('editId');
    const { toast } = useToast();
    
    const [biblioteca, setBiblioteca] = useState<Exercicio[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            exercicios: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "exercicios",
    });

    useEffect(() => {
        setBiblioteca(getBibliotecaDeExercicios());
        if (editId) {
            const rotinas = getRotinas();
            const rotinaParaEditar = rotinas.find(r => r.id === editId);
            if (rotinaParaEditar) {
                form.reset(rotinaParaEditar);
                setIsEditMode(true);
            }
        }
    }, [editId, form]);

    const handleAddExercise = () => {
        append({ exercicioId: '', nomeExercicio: '', seriesAlvo: 3, repeticoesAlvo: 10 });
    };

    const handleExerciseSelect = (index: number, exercicioId: string) => {
        const exercicioSelecionado = biblioteca.find(ex => ex.id === exercicioId);
        if (exercicioSelecionado) {
            form.setValue(`exercicios.${index}.exercicioId`, exercicioId);
            form.setValue(`exercicios.${index}.nomeExercicio`, exercicioSelecionado.nome);
        }
    };
    
    const onSubmit = (values: FormValues) => {
        if (isEditMode && values.id) {
            atualizarRotina(values as RotinaDeTreino);
             toast({
                title: "Rotina Atualizada!",
                description: "Suas alterações foram salvas.",
            });
        } else {
            const newRoutine = { ...values, id: uuidv4() };
            salvarRotina(newRoutine);
             toast({
                title: "Rotina Salva!",
                description: "Sua nova rotina manual foi criada.",
            });
        }
        router.push('/routines');
    };

    return (
        <>
            <PageHeader title={isEditMode ? "Editar Rotina" : "Criar Rotina Manualmente"} description="Monte seu treino exatamente como você quer.">
                 <Button variant="outline" asChild>
                    <Link href="/routines">
                        <ArrowLeft className="mr-2" />
                        Voltar
                    </Link>
                </Button>
            </PageHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Detalhes da Rotina</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Nome da Rotina</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Treino A - Foco em Peito" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>Exercícios</CardTitle>
                            <CardDescription>Adicione e configure os exercícios da sua rotina.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                    <FormField
                                        control={form.control}
                                        name={`exercicios.${index}.exercicioId`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Exercício</FormLabel>
                                            <Select onValueChange={(value) => { field.onChange(value); handleExerciseSelect(index, value); }} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um exercício" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {biblioteca.map(ex => (
                                                        <SelectItem key={ex.id} value={ex.id}>{ex.nome}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={`exercicios.${index}.seriesAlvo`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Séries</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`exercicios.${index}.repeticoesAlvo`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Repetições</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                     <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-3 -right-3"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                            {form.formState.errors.exercicios && !form.formState.errors.exercicios.root && (
                                <p className="text-sm font-medium text-destructive">
                                    {form.formState.errors.exercicios.message}
                                </p>
                            )}
                            <Button type="button" variant="outline" className="w-full" onClick={handleAddExercise}>
                                <Plus className="mr-2" /> Adicionar Exercício
                            </Button>
                        </CardContent>
                    </Card>
                     <div className="flex justify-end">
                        <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Salvar Rotina'}</Button>
                    </div>
                </form>
            </Form>
        </>
    )
}


export default function ManualCreatePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ManualCreateContent />
        </Suspense>
    )
}

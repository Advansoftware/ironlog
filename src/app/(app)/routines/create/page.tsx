'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { generateRoutine } from '@/ai/flows/generate-routine';
import { getBibliotecaDeExercicios, salvarRotina } from '@/lib/storage';
import type { RotinaDeTreino } from '@/lib/types';
import { ArrowLeft, Loader2, Sparkles, Wand2, Plus } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  objetivo: z.string().min(1, 'O objetivo é obrigatório.'),
  nivelExperiencia: z.string().min(1, 'O nível de experiência é obrigatório.'),
  diasPorSemana: z.coerce.number().min(1, 'Pelo menos 1 dia é necessário.').max(7),
  localDeTreino: z.string().min(1, 'O local de treino é obrigatório.'),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateRoutinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<RotinaDeTreino | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objetivo: 'Hipertrofia',
      nivelExperiencia: 'Iniciante',
      diasPorSemana: 3,
      localDeTreino: 'Academia',
      observacoes: '',
    },
  });

  const handleGenerateRoutine = async (values: FormValues) => {
    setIsLoading(true);
    setGeneratedRoutine(null);

    try {
      const exerciciosDisponiveis = getBibliotecaDeExercicios();
      const result = await generateRoutine({
        ...values,
        exerciciosDisponiveis: JSON.stringify(exerciciosDisponiveis),
      });

      setGeneratedRoutine({
        id: uuidv4(),
        nome: result.nome,
        exercicios: result.exercicios,
      });

      toast({
        title: 'Rotina Gerada com Sucesso!',
        description: 'Revise os detalhes e salve se estiver satisfeito.',
      });
    } catch (error) {
      console.error('Falha ao gerar rotina:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Rotina',
        description: 'Não foi possível se conectar à IA. Verifique sua conexão ou tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoutine = () => {
    if (!generatedRoutine) return;
    salvarRotina(generatedRoutine);
    toast({
      title: 'Rotina Salva!',
      description: 'Sua nova rotina está pronta para ser usada.',
    });
    router.push('/routines');
  };

  return (
    <>
      <PageHeader title="Criar Rotina com IA" description="Descreva seu treino ideal e deixe a IA fazer o trabalho pesado.">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/routines">
              <ArrowLeft className="mr-2" />
              Voltar
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/routines/create/manual">
              <Plus className="mr-2" />
              Criar Manualmente
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Preencha suas Metas</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateRoutine)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="objetivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual seu objetivo principal?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um objetivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hipertrofia">Hipertrofia (Ganho de Massa)</SelectItem>
                          <SelectItem value="Força">Força</SelectItem>
                          <SelectItem value="Resistência">Resistência Muscular</SelectItem>
                          <SelectItem value="Emagrecimento">Emagrecimento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nivelExperiencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual seu nível de experiência?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Iniciante">Iniciante (0-1 ano)</SelectItem>
                          <SelectItem value="Intermediário">Intermediário (1-3 anos)</SelectItem>
                          <SelectItem value="Avançado">Avançado (3+ anos)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diasPorSemana"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantos dias por semana pode treinar?</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="localDeTreino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onde você vai treinar?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o local" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Academia">Academia (equipamentos completos)</SelectItem>
                          <SelectItem value="Casa">Casa (peso do corpo e halteres)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: Foco em peito, evitar agachamento por dor no joelho, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando, aguarde...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" />
                      Gerar Rotina
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Resultado da IA</CardTitle>
            <CardDescription>Aqui está a rotina sugerida. Você pode salvá-la ou gerar novamente.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Wand2 className="size-16 animate-pulse text-primary" />
                <p>Aguarde enquanto a IA monta seu treino...</p>
              </div>
            )}
            {!isLoading && !generatedRoutine && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p>Sua rotina personalizada aparecerá aqui.</p>
              </div>
            )}
            {generatedRoutine && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">{generatedRoutine.nome}</h3>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                  {generatedRoutine.exercicios.map((ex) => (
                    <div key={ex.exercicioId} className="p-3 bg-secondary/50 rounded-lg">
                      <p className="font-semibold">{ex.nomeExercicio}</p>
                      <p className="text-sm text-muted-foreground">
                        {ex.seriesAlvo} séries de {ex.repeticoesAlvo} reps
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => form.handleSubmit(handleGenerateRoutine)()}
              disabled={isLoading || !form.formState.isValid}
              className="w-full"
            >
              <Sparkles className="mr-2" />
              Gerar Novamente
            </Button>
            <Button onClick={handleSaveRoutine} disabled={!generatedRoutine} className="w-full">
              Salvar Rotina
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

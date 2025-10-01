
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { resetAllData, getDbConnections, saveDbConnections } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Database, Trash2, Signal } from 'lucide-react';
import type { DbConnectionConfig } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const dbConnectionSchema = z.object({
  name: z.string().min(1, "O nome da conexão é obrigatório."),
  url: z.string().url("Por favor, insira uma URL do MongoDB válida."),
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [connections, setConnections] = useState<DbConnectionConfig[]>([]);
    const [isResetDialogOpen, setResetDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

    useEffect(() => {
        setConnections(getDbConnections());
    }, []);

    const form = useForm<z.infer<typeof dbConnectionSchema>>({
        resolver: zodResolver(dbConnectionSchema),
        defaultValues: {
            name: "",
            url: "",
            email: "",
            password: "",
        },
    });

    const handleAddConnection = (values: z.infer<typeof dbConnectionSchema>) => {
        const newConnection: DbConnectionConfig = { id: uuidv4(), ...values };
        const updatedConnections = [...connections, newConnection];
        saveDbConnections(updatedConnections);
        setConnections(updatedConnections);
        form.reset();
        toast({
            title: 'Conexão Salva',
            description: 'Sua nova configuração de banco de dados foi salva localmente.',
        });
    };

    const handleDeleteConnection = (id: string) => {
        const updatedConnections = connections.filter(c => c.id !== id);
        saveDbConnections(updatedConnections);
        setConnections(updatedConnections);
        setDeleteDialogOpen(null);
        toast({
            title: 'Conexão Removida',
        });
    };

    const handleResetData = () => {
        try {
            resetAllData();
            toast({
                title: 'Dados Resetados!',
                description: 'Todos os seus dados foram apagados e o app foi restaurado para o estado inicial.',
            });
            router.push('/dashboard');
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Erro ao Resetar',
                description: 'Não foi possível resetar os dados. Tente novamente.',
            });
        } finally {
            setResetDialogOpen(false);
        }
    }


  return (
    <TooltipProvider>
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações e dados do seu aplicativo."
      />

        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Database className="text-primary"/>
                    Sincronização de Dados
                </CardTitle>
                <CardDescription>Adicione uma URL de banco de dados MongoDB para sincronizar seus dados entre dispositivos.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddConnection)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nome da Conexão</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Meu PC de Casa" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>URL de Conexão do MongoDB</FormLabel>
                                <FormControl>
                                    <Input placeholder="mongodb+srv://..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="seu-email@exemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Adicionar Conexão</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>

        {connections.length > 0 && (
            <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold">Conexões Salvas</h3>
                {connections.map(conn => (
                    <Card key={conn.id} className="flex flex-col md:flex-row items-center justify-between p-4">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                             <Database className="text-primary size-6"/>
                             <div>
                                <p className="font-semibold">{conn.name}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-xs">{conn.url}</p>
                             </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {/* O Tooltip precisa de um elemento real para se ancorar. 
                                        Um span envolvendo o botão desabilitado funciona. */}
                                    <span tabIndex={0}>
                                        <Button variant="outline" disabled className="w-full">
                                            <Signal className="mr-2"/>
                                            Sincronizar
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>A funcionalidade de back-end ainda não foi implementada.</p>
                                </TooltipContent>
                            </Tooltip>
                            
                            <AlertDialog open={isDeleteDialogOpen === conn.id} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(conn.id)}>
                                        <Trash2 className="size-4 text-destructive"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Remover Conexão?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        A configuração para "{conn.name}" será removida permanentemente.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteConnection(conn.id)} variant="destructive">
                                        Remover
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>
                    </Card>
                ))}
            </div>
        )}

      <Card className="border-destructive/50">
        <CardHeader>
            <div className="flex items-center gap-4">
                <AlertTriangle className="size-8 text-destructive"/>
                <div>
                    <CardTitle>Zona de Perigo</CardTitle>
                    <CardDescription>Ações nesta seção são permanentes e não podem ser desfeitas.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Ao clicar no botão abaixo, todos os seus dados, incluindo rotinas, histórico de treinos, recordes pessoais e progresso de nível, serão apagados permanentemente do seu dispositivo. O aplicativo retornará ao seu estado inicial.
            </p>
        </CardContent>
        <CardFooter>
            <AlertDialog open={isResetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Resetar Todos os Dados</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso deletará permanentemente todos os seus dados.
                        Seus treinos, suas rotinas e seu progresso serão perdidos para sempre.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleResetData}
                        variant="destructive"
                    >
                        Sim, eu entendo, apagar tudo
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

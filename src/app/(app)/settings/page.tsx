
'use client';

import { useState } from 'react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { resetAllData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();

    const handleResetData = () => {
        try {
            resetAllData();
            toast({
                title: 'Dados Resetados!',
                description: 'Todos os seus dados foram apagados e o app foi restaurado para o estado inicial.',
            });
            // Força o recarregamento da página para refletir o estado inicial
            router.push('/dashboard');
            window.location.reload();
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Erro ao Resetar',
                description: 'Não foi possível resetar os dados. Tente novamente.',
            });
        }
    }


  return (
    <>
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações e dados do seu aplicativo."
      />

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
                Ao clicar no botão abaixo, todos os seus dados, incluindo rotinas, histórico de treinos, recordes pessoais e progresso de nível, serão apagados permanentemente. O aplicativo retornará ao seu estado inicial.
            </p>
        </CardContent>
        <CardFooter>
            <AlertDialog>
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
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Sim, eu entendo, apagar tudo
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
}

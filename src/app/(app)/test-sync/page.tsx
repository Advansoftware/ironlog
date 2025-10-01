"use client";

/**
 * Página de teste para sincronização WGER
 * Acesse /test-sync para testar a integração
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/hooks/use-toast";
import { syncRoutineToWger, syncSessionToWger } from "@/lib/wger-api";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, TestTube } from "lucide-react";

// Dados de teste
const testRoutine = {
  id: "test-routine-" + Date.now(),
  nome: "Rotina de Teste - IronLog Sync",
  exercicios: [
    {
      exercicioId: "ex1",
      nomeExercicio: "Supino Reto com Barra",
      seriesAlvo: 3,
      repeticoesAlvo: 12,
      pesoAlvo: 60,
    },
    {
      exercicioId: "ex4",
      nomeExercicio: "Barra Fixa",
      seriesAlvo: 3,
      repeticoesAlvo: 8,
    },
  ],
};

const testSession = {
  id: "test-session-" + Date.now(),
  rotinaId: testRoutine.id,
  nome: testRoutine.nome,
  data: new Date().toISOString(),
  exercicios: [
    {
      exercicioId: "ex1",
      series: [
        { reps: 12, peso: 60, concluido: true },
        { reps: 10, peso: 65, concluido: true },
        { reps: 8, peso: 70, concluido: true },
      ],
    },
  ],
  duracao: 30,
  xpGanho: 100,
};

export default function TestSyncPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    routine?: { success: boolean; id?: any; error?: string };
    session?: { success: boolean; id?: any; error?: string };
  }>({});

  const testRoutineSync = async () => {
    setLoading(true);
    try {
      console.log("🧪 Testando sincronização de rotina...");
      const wgerRoutineId = await syncRoutineToWger(testRoutine);

      setResults((prev) => ({
        ...prev,
        routine: { success: true, id: wgerRoutineId },
      }));

      toast({
        title: "Rotina Sincronizada!",
        description: `ID da rotina no WGER: ${wgerRoutineId}`,
      });
    } catch (error) {
      console.error("❌ Erro na sincronização da rotina:", error);
      setResults((prev) => ({
        ...prev,
        routine: { success: false, error: String(error) },
      }));

      toast({
        variant: "destructive",
        title: "Erro na Sincronização",
        description: "Falha ao sincronizar rotina com WGER",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSessionSync = async () => {
    setLoading(true);
    try {
      console.log("🧪 Testando sincronização de sessão...");
      const wgerSessionId = await syncSessionToWger(testSession);

      setResults((prev) => ({
        ...prev,
        session: { success: true, id: wgerSessionId },
      }));

      toast({
        title: "Sessão Sincronizada!",
        description: `ID da sessão no WGER: ${wgerSessionId}`,
      });
    } catch (error) {
      console.error("❌ Erro na sincronização da sessão:", error);
      setResults((prev) => ({
        ...prev,
        session: { success: false, error: String(error) },
      }));

      toast({
        variant: "destructive",
        title: "Erro na Sincronização",
        description: "Falha ao sincronizar sessão com WGER",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    await testRoutineSync();
    await testSessionSync();
  };

  return (
    <>
      <PageHeader
        title="Teste de Sincronização WGER"
        description="Teste a integração bidirecional com a API do WGER"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Controles de Teste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="size-5" />
              Testes Disponíveis
            </CardTitle>
            <CardDescription>
              Execute os testes para verificar a sincronização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testRoutineSync}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar Sincronização de Rotina"
              )}
            </Button>

            <Button
              onClick={testSessionSync}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar Sincronização de Sessão"
              )}
            </Button>

            <Button
              onClick={testAll}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "Executar Todos os Testes"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
            <CardDescription>Status da sincronização com WGER</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resultado da Rotina */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                Sincronização de Rotina
                {results.routine?.success === true && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="mr-1 size-3" />
                    Sucesso
                  </Badge>
                )}
                {results.routine?.success === false && (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 size-3" />
                    Falha
                  </Badge>
                )}
              </h4>
              {results.routine?.id && (
                <p className="text-sm text-muted-foreground">
                  ID no WGER: {JSON.stringify(results.routine.id)}
                </p>
              )}
              {results.routine?.error && (
                <p className="text-sm text-red-500">
                  Erro: {results.routine.error}
                </p>
              )}
            </div>

            {/* Resultado da Sessão */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                Sincronização de Sessão
                {results.session?.success === true && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="mr-1 size-3" />
                    Sucesso
                  </Badge>
                )}
                {results.session?.success === false && (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 size-3" />
                    Falha
                  </Badge>
                )}
              </h4>
              {results.session?.id && (
                <p className="text-sm text-muted-foreground">
                  ID no WGER: {JSON.stringify(results.session.id)}
                </p>
              )}
              {results.session?.error && (
                <p className="text-sm text-red-500">
                  Erro: {results.session.error}
                </p>
              )}
            </div>

            {/* Links para WGER */}
            {(results.routine?.success || results.session?.success) && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-sm font-medium">Links do WGER:</p>
                <div className="space-y-1 text-sm">
                  <a
                    href="https://fit.advansoftware.shop/routine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-500 hover:underline"
                  >
                    Ver Rotinas no WGER →
                  </a>
                  <a
                    href="https://fit.advansoftware.shop/workout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-500 hover:underline"
                  >
                    Ver Sessões no WGER →
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados de Teste */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dados de Teste</CardTitle>
            <CardDescription>
              Dados que serão enviados para WGER durante os testes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Rotina de Teste:</h4>
                <pre className="text-xs bg-secondary p-2 rounded overflow-auto">
                  {JSON.stringify(testRoutine, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Sessão de Teste:</h4>
                <pre className="text-xs bg-secondary p-2 rounded overflow-auto">
                  {JSON.stringify(testSession, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

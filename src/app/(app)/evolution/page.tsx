"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Icons } from "@/components/icons";
import { Bot, Loader2, Send, Sparkles, User, Wand2 } from "lucide-react";
import {
  getGamification,
  getHistorico,
  getRecordesPessoais,
  getRotinas,
  salvarRotina,
  atualizarRotina,
  deletarRotina,
  getBibliotecaDeExercicios,
  salvarGamification,
} from "@/lib/storage";
import { evolveRoutinePlan } from "@/ai/flows/evolve-routine-plan";
import { suggestRoutineEvolution } from "@/ai/flows/suggest-routine-evolution";
import type { PlanoDeAcao, RotinaParaModificar } from "@/ai/flows/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { RotinaDeTreino } from "@/lib/types";

interface ChatMessage {
  role: "user" | "ia";
  content: string;
  plan?: PlanoDeAcao;
}

export default function EvolutionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAwaitingPlanConfirmation, setIsAwaitingPlanConfirmation] =
    useState(false);
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll suave apenas na área do chat, sem afetar o layout geral
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  useEffect(() => {
    async function startConversation() {
      setIsLoading(true);
      const gamification = getGamification();
      const historico = getHistorico();
      const recordes = getRecordesPessoais();

      try {
        const result = await suggestRoutineEvolution({
          newLevel: gamification.level,
          workoutHistory: JSON.stringify(historico.slice(0, 50)), // Limita o histórico para não estourar o prompt
          personalRecords: JSON.stringify(recordes),
        });

        setMessages([{ role: "ia", content: result.suggestion }]);
      } catch (error) {
        console.error("Falha ao iniciar conversa com IA:", error);
        setMessages([
          {
            role: "ia",
            content:
              "Olá! Parabéns por evoluir. Como podemos ajustar seu treino para continuar progredindo?",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    startConversation();
  }, []);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() && messages.length > 0) return;

    const userMessage: ChatMessage = { role: "user", content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsAwaitingPlanConfirmation(false);

    // Formata o histórico da conversa
    const conversationHistory = [...messages, userMessage]
      .slice(-6) // Pega as últimas 6 mensagens para manter o contexto
      .map((m) => `${m.role === "ia" ? "IA" : "Usuário"}: ${m.content}`)
      .join("\n");

    try {
      const result = await evolveRoutinePlan({
        historicoConversa: conversationHistory,
        rotinasAtuais: JSON.stringify(getRotinas()),
        historicoTreinos: JSON.stringify(getHistorico().slice(0, 50)),
        recordesPessoais: JSON.stringify(getRecordesPessoais()),
        exerciciosDisponiveis: JSON.stringify(getBibliotecaDeExercicios()),
        nivelUsuario: getGamification().level,
      });

      const hasPlan =
        result.rotinasParaCriar?.length ||
        result.rotinasParaModificar?.length ||
        result.rotinasParaRemover?.length;
      setMessages((prev) => [
        ...prev,
        {
          role: "ia",
          content: result.mensagemDeAcompanhamento,
          plan: hasPlan ? result : undefined,
        },
      ]);
      if (hasPlan) {
        setIsAwaitingPlanConfirmation(true);
      }
    } catch (error) {
      console.error("Erro na chamada da IA:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ia",
          content:
            "Desculpe, não consegui processar sua solicitação. Poderia tentar novamente?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPlan = (plan: PlanoDeAcao) => {
    try {
      // Se for uma correção completa, ajustar XP/nível primeiro
      if (plan.correcaoCompleta && plan.novoXp !== undefined) {
        const gamificationAtual = getGamification();
        const novoNivel = plan.novoXp === 0 ? 1 : plan.novoXp >= 2500 ? 3 : 2;

        salvarGamification({
          ...gamificationAtual,
          xp: plan.novoXp,
          level: novoNivel,
        });

        toast({
          title: "Perfil Corrigido!",
          description: `Seu nível foi ajustado para ${novoNivel}. ${plan.motivoCorrecao}`,
          duration: 5000,
        });
      }

      // Aplicar mudanças nas rotinas
      plan.rotinasParaCriar?.forEach((rotina) =>
        salvarRotina({ ...rotina, id: uuidv4() })
      );
      plan.rotinasParaModificar?.forEach((rotina) =>
        atualizarRotina(rotina as RotinaDeTreino)
      );
      plan.rotinasParaRemover?.forEach((id) => deletarRotina(id));

      const title = plan.correcaoCompleta
        ? "Correção Completa Aplicada!"
        : "Plano de Treino Atualizado!";

      const description = plan.correcaoCompleta
        ? "Seu perfil e rotinas foram corrigidos completamente."
        : "Suas rotinas foram modificadas com sucesso.";

      toast({
        title,
        description,
      });

      const confirmationMessage = plan.correcaoCompleta
        ? "Correção aplicada com sucesso! Agora seu plano está alinhado com seu nível real. Podemos fazer mais algum ajuste?"
        : "Plano aplicado com sucesso! Podemos fazer mais algum ajuste ou está tudo certo?";

      setMessages((prev) => [
        ...prev,
        { role: "ia", content: confirmationMessage },
      ]);
      setIsAwaitingPlanConfirmation(false);
    } catch (error) {
      console.error("Erro ao aplicar plano:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Aplicar Plano",
        description: "Houve um problema ao salvar suas novas rotinas.",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Personal Trainer IA"
        description="Converse com a IA para evoluir seu plano de treino de forma inteligente."
      />

      <div className="flex flex-col h-[75vh] bg-card rounded-lg border overflow-hidden">
        {/* Área de Chat com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${
                msg.role === "ia" ? "" : "justify-end"
              }`}
            >
              {msg.role === "ia" && (
                <div className="flex-shrink-0 size-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  <Bot size={18} />
                </div>
              )}
              <div
                className={`max-w-xl p-4 rounded-lg ${
                  msg.role === "ia"
                    ? "bg-secondary"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.plan && (
                  <Card className="mt-4 bg-background/50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Wand2 className="text-primary" />
                        Plano de Ação Sugerido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      {msg.plan.rotinasParaCriar &&
                        msg.plan.rotinasParaCriar.length > 0 && (
                          <div>
                            <strong className="text-foreground">Criar:</strong>{" "}
                            {msg.plan.rotinasParaCriar
                              .map((r) => r.nome)
                              .join(", ")}
                          </div>
                        )}
                      {msg.plan.rotinasParaModificar &&
                        msg.plan.rotinasParaModificar.length > 0 && (
                          <div>
                            <strong className="text-foreground">
                              Modificar:
                            </strong>{" "}
                            {msg.plan.rotinasParaModificar
                              .map((r) => r.nome)
                              .join(", ")}
                          </div>
                        )}
                      {msg.plan.rotinasParaRemover &&
                        msg.plan.rotinasParaRemover.length > 0 && (
                          <div>
                            <strong className="text-foreground">
                              Remover:
                            </strong>{" "}
                            {msg.plan.rotinasParaRemover.length} rotina(s)
                          </div>
                        )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        size="sm"
                        onClick={() => applyPlan(msg.plan!)}
                        disabled={!isAwaitingPlanConfirmation}
                      >
                        <Sparkles size={16} className="mr-2" />
                        Aplicar Plano
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 size-8 bg-secondary rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 size-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                <Bot size={18} />
              </div>
              <div className="max-w-xl p-4 rounded-lg bg-secondary flex items-center">
                <Loader2 className="animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Fixo */}
        <div className="flex-shrink-0 p-4 bg-background/50 backdrop-blur-sm border-t">
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua resposta..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              disabled={isLoading || isAwaitingPlanConfirmation}
            />
            <Button
              onClick={() => handleSendMessage(input)}
              disabled={isLoading || isAwaitingPlanConfirmation}
            >
              <Send size={16} />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

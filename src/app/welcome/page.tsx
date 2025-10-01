"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Icons } from "@/components/icons";
import { Bot, Loader2, Send, Sparkles, User, Wand2 } from "lucide-react";
import {
  getBibliotecaDeExercicios,
  salvarRotina,
  salvarGamification,
  salvarUnlockedAchievements,
  hasCompletedOnboarding,
} from "@/lib/storage";
import { initializeUserPlan } from "@/ai/flows/initialize-user-plan";
import type { PlanoDeAcao } from "@/ai/flows/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import {
  checkForLevelUp,
  levelThresholds,
  levelData,
} from "@/lib/gamification";

interface ChatMessage {
  role: "user" | "ia";
  content: string;
  plan?: PlanoDeAcao;
}

export default function WelcomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAwaitingPlanConfirmation, setIsAwaitingPlanConfirmation] =
    useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Função para calcular o nível baseado no XP
  const getLevelByXp = (xp: number): { level: number; levelName: string } => {
    let level = 1;
    for (const levelNum in levelThresholds) {
      if (xp >= levelThresholds[levelNum]) {
        level = parseInt(levelNum, 10);
      }
    }
    return {
      level,
      levelName: levelData[level]?.name || `Nível ${level}`,
    };
  };

  useEffect(() => {
    // Redireciona se o onboarding já foi concluído
    if (hasCompletedOnboarding()) {
      router.replace("/dashboard");
      return;
    }

    setMessages([
      {
        role: "ia",
        content:
          "Olá! Sou seu personal trainer de IA, e juntos vamos construir o plano perfeito para você. Vou fazer algumas perguntas para conhecer melhor seu perfil e criar o treino ideal. Para começar, me diga: qual é seu principal objetivo? Ganhar massa muscular (Hipertrofia), ficar mais forte, emagrecer, ou algo diferente?",
      },
    ]);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    // Scroll suave apenas na área do chat, sem afetar o layout geral
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsAwaitingPlanConfirmation(false);

    const conversationHistory = [...messages, userMessage]
      .slice(-8)
      .map((m) => `${m.role === "ia" ? "IA" : "Usuário"}: ${m.content}`)
      .join("\n");

    try {
      const result = await initializeUserPlan({
        historicoConversa: conversationHistory,
        exerciciosDisponiveis: JSON.stringify(getBibliotecaDeExercicios()),
      });

      const hasPlan = result.rotinasParaCriar?.length;
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
      console.error("Erro na chamada da IA de onboarding:", error);
      toast({
        variant: "destructive",
        title: "Erro de Conexão",
        description:
          "Não consegui processar a solicitação. Verifique sua conexão e tente novamente.",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "ia",
          content:
            "Desculpe, tive um problema para me conectar. Podemos tentar de novo? Por favor, me diga seu principal objetivo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyInitialPlan = (plan: PlanoDeAcao) => {
    try {
      if (!plan.rotinasParaCriar || plan.rotinasParaCriar.length === 0) {
        throw new Error("O plano inicial não contém rotinas para criar.");
      }

      // Salva as rotinas com um prefixo de IA
      plan.rotinasParaCriar.forEach((rotina) =>
        salvarRotina({ ...rotina, id: `rt-ai-${uuidv4()}` })
      );

      // Define o XP e nível inicial com base na avaliação da IA
      const initialXp = plan.xpInicial || 1;
      const { newLevel } = checkForLevelUp(0, initialXp);
      salvarGamification({ xp: initialXp, level: newLevel });

      // Desbloqueia as primeiras conquistas
      salvarUnlockedAchievements([
        { id: "first-ai-routine", date: new Date().toISOString() },
      ]);

      toast({
        title: "Plano de Treino Criado!",
        description: "Seja bem-vindo ao IronLog. Seu dashboard está pronto!",
      });
      toast({
        title: "Conquista Desbloqueada!",
        description: "Amigo da IA",
      });

      // Redireciona para o dashboard, que agora vai carregar o estado correto.
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao aplicar plano inicial:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar Plano",
        description:
          "Houve um problema ao salvar sua primeira rotina. Tente gerar novamente.",
      });
      setIsAwaitingPlanConfirmation(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Animated Gradient Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 animated-gradient-blob-1"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animated-gradient-blob-2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-50 animated-gradient-blob-3"></div>

      {/* Header Fixo */}
      <header className="flex-shrink-0 z-10 p-4 pt-8 md:p-8 flex flex-col items-center text-center bg-background/50 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center gap-3 mb-4">
          <Icons.Logo className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo ao IronLog!
          </h1>
        </div>
        <p className="text-muted-foreground max-w-lg">
          Vamos construir seu plano de treino inicial juntos. Responda às
          perguntas para que eu possa criar a melhor estratégia para você.
        </p>
      </header>

      {/* Container Principal */}
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto z-10 overflow-hidden">
        {/* Área de Chat com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
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
                        Plano Inicial Sugerido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      {msg.plan.rotinasParaCriar &&
                        msg.plan.rotinasParaCriar.length > 0 && (
                          <div>
                            <strong className="text-foreground">
                              Rotinas a Criar:
                            </strong>{" "}
                            {msg.plan.rotinasParaCriar
                              .map((r) => r.nome)
                              .join(", ")}
                          </div>
                        )}
                      {(() => {
                        // Sempre mostra o nível inicial, calculando baseado no XP ou como fallback
                        const calcularNivelInicial = () => {
                          // Se tem XP inicial, usa para calcular
                          if (msg.plan.xpInicial) {
                            return getLevelByXp(msg.plan.xpInicial);
                          }
                          
                          // Fallback: estima baseado no conteúdo da conversa
                          const conversaCompleta = messages.map(m => m.content.toLowerCase()).join(' ');
                          if (conversaCompleta.includes('intermediário') || conversaCompleta.includes('intermediate')) {
                            return { level: 2, levelName: levelData[2]?.name || 'Tá Saindo da Jaula' };
                          }
                          if (conversaCompleta.includes('avançado') || conversaCompleta.includes('advanced')) {
                            return { level: 3, levelName: levelData[3]?.name || 'Muleque Zica' };
                          }
                          // Padrão: iniciante
                          return { level: 1, levelName: levelData[1]?.name || 'Frango em Crescimento' };
                        };

                        const { level, levelName } = calcularNivelInicial();
                        return (
                          <div>
                            <strong className="text-foreground">
                              Nível Inicial:
                            </strong>{" "}
                            {levelName} (Nível {level})
                          </div>
                        );
                      })()}
                    </CardContent>
                    <CardFooter>
                      <Button
                        size="sm"
                        onClick={() => applyInitialPlan(msg.plan!)}
                        disabled={!isAwaitingPlanConfirmation}
                      >
                        <Sparkles size={16} className="mr-2" />
                        Aprovar e Começar!
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
          {isLoading && messages.length > 0 && (
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
        <div className="flex-shrink-0 p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua resposta..."
              className="flex-1 resize-none bg-background/80 backdrop-blur-sm"
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
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0"
            >
              <Send size={18} />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Bot, Loader2, Send, Sparkles, User, Wand2 } from 'lucide-react';
import { getBibliotecaDeExercicios, salvarRotina, salvarGamification, salvarUnlockedAchievements } from '@/lib/storage';
import { initializeUserPlan } from '@/ai/flows/initialize-user-plan';
import type { PlanoDeAcao } from '@/ai/flows/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { checkForLevelUp } from '@/lib/gamification';

interface ChatMessage {
  role: 'user' | 'ia';
  content: string;
  plan?: PlanoDeAcao;
}

export default function WelcomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAwaitingPlanConfirmation, setIsAwaitingPlanConfirmation] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicia a conversa com uma mensagem da IA
  useEffect(() => {
    setMessages([{ 
        role: 'ia', 
        content: 'Olá! Sou seu personal trainer de IA, e juntos vamos construir o plano perfeito para você. Para começar, me diga: qual é seu principal objetivo? Ganhar massa muscular (Hipertrofia), ficar mais forte, emagrecer, ou algo diferente?' 
    }]);
    setIsLoading(false);
  }, []);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsAwaitingPlanConfirmation(false);

    const conversationHistory = [...messages, userMessage]
        .slice(-8)
        .map(m => `${m.role === 'ia' ? 'IA' : 'Usuário'}: ${m.content}`)
        .join('\n');

    try {
        const result = await initializeUserPlan({
            historicoConversa: conversationHistory,
            exerciciosDisponiveis: JSON.stringify(getBibliotecaDeExercicios()),
        });

        const hasPlan = result.rotinasParaCriar?.length;
        setMessages(prev => [...prev, { role: 'ia', content: result.mensagemDeAcompanhamento, plan: hasPlan ? result : undefined }]);
        if(hasPlan) {
            setIsAwaitingPlanConfirmation(true);
        }

    } catch (error) {
        console.error('Erro na chamada da IA de onboarding:', error);
        toast({
            variant: 'destructive',
            title: 'Erro de Conexão',
            description: 'Não consegui processar a solicitação. Verifique sua conexão e tente novamente.'
        });
        setMessages(prev => [...prev, { role: 'ia', content: 'Desculpe, tive um problema para me conectar. Podemos tentar de novo? Por favor, me diga seu principal objetivo.' }]);
    } finally {
        setIsLoading(false);
    }
  }

  const applyInitialPlan = (plan: PlanoDeAcao) => {
    try {
      if (!plan.rotinasParaCriar || plan.rotinasParaCriar.length === 0) {
        throw new Error("O plano inicial não contém rotinas para criar.");
      }

      // Salva as rotinas
      plan.rotinasParaCriar.forEach(rotina => salvarRotina({ ...rotina, id: `rt-ai-${uuidv4()}` }));

      // Define o XP e nível inicial com base na avaliação da IA
      const initialXp = plan.xpInicial || 1;
      const { newLevel } = checkForLevelUp(0, initialXp);
      salvarGamification({ xp: initialXp, level: newLevel });
      
      // Desbloqueia as primeiras conquistas
      const initialAchievements = [
        { id: 'first-workout', date: new Date().toISOString() },
        { id: 'first-ai-routine', date: new Date().toISOString() },
      ];
      salvarUnlockedAchievements(initialAchievements);

      toast({
        title: 'Plano de Treino Criado!',
        description: 'Seja bem-vindo ao IronLog. Seu dashboard está pronto!',
      });
      toast({
        title: "Conquista Desbloqueada!",
        description: "Primeiro Passo",
      });
      toast({
        title: "Conquista Desbloqueada!",
        description: "Amigo da IA",
      });
      
      // Força um reload para que o client-layout detecte a mudança e redirecione
      router.push('/dashboard');
      setTimeout(() => window.location.reload(), 300);

    } catch (error) {
      console.error('Erro ao aplicar plano inicial:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar Plano',
        description: 'Houve um problema ao salvar sua primeira rotina. Tente gerar novamente.',
      });
       setIsAwaitingPlanConfirmation(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background p-4 justify-center items-center relative overflow-hidden">
      {/* Animated Gradient Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-50 animated-gradient-blob-1"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animated-gradient-blob-2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-50 animated-gradient-blob-3"></div>

      <div className="z-10 flex flex-col items-center">
       <div className="flex items-center gap-3 mb-4">
            <Icons.Logo className="size-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao IronLog!</h1>
        </div>
        <p className="text-muted-foreground mb-8 text-center max-w-lg">Vamos construir seu plano de treino inicial juntos. Responda às perguntas para que eu possa criar a melhor estratégia para você.</p>
      </div>

      <div className="flex flex-col w-full max-w-2xl h-[60vh] bg-card/80 backdrop-blur-lg rounded-lg border z-10">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'ia' ? '' : 'justify-end'}`}>
              {msg.role === 'ia' && <div className="flex-shrink-0 size-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground"><Bot size={18} /></div>}
              <div className={`max-w-xl p-4 rounded-lg ${msg.role === 'ia' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
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
                            {msg.plan.rotinasParaCriar && msg.plan.rotinasParaCriar.length > 0 && <div><strong className="text-foreground">Rotinas a Criar:</strong> {msg.plan.rotinasParaCriar.map(r => r.nome).join(', ')}</div>}
                        </CardContent>
                        <CardFooter>
                             <Button size="sm" onClick={() => applyInitialPlan(msg.plan!)} disabled={!isAwaitingPlanConfirmation}>
                                <Sparkles size={16} className="mr-2"/>
                                Aprovar e Começar!
                            </Button>
                        </CardFooter>
                    </Card>
                )}
              </div>
              {msg.role === 'user' && <div className="flex-shrink-0 size-8 bg-secondary rounded-full flex items-center justify-center"><User size={18}/></div>}
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 size-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground"><Bot size={18} /></div>
                  <div className="max-w-xl p-4 rounded-lg bg-secondary flex items-center">
                    <Loader2 className="animate-spin" />
                  </div>
              </div>
            )}
            <div ref={bottomRef} />
        </div>
        <div className="p-4 bg-background/50 border-t">
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua resposta..."
              className="flex-1 resize-none bg-transparent"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              disabled={isLoading || isAwaitingPlanConfirmation}
            />
            <Button onClick={() => handleSendMessage(input)} disabled={isLoading || isAwaitingPlanConfirmation} size="icon" className="rounded-full flex-shrink-0">
              <Send size={16} />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

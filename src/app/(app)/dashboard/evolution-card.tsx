
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2 } from 'lucide-react';

export function EvolutionCard() {
    return (
        <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/10 via-background to-background">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="text-primary" />
                    Hora de Evoluir seu Treino!
                </CardTitle>
                <CardDescription>Parabéns por subir de nível! Você desbloqueou a chance de otimizar suas rotinas com nosso personal trainer de IA.</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground leading-relaxed">
                Sua dedicação está dando resultados. Para continuar progredindo, é uma boa ideia ajustar seu plano. Vamos conversar sobre seus objetivos e criar a próxima fase do seu treinamento?
            </p>
            </CardContent>
        <CardFooter>
            <Button asChild>
                <Link href="/evolution">
                    <Sparkles className="mr-2" />
                    Conversar com a IA
                </Link>
            </Button>
        </CardFooter>
        </Card>
    );
}

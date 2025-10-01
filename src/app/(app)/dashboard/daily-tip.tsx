
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';

interface DailyTipProps {
    tip: string | null;
    isLoading: boolean;
}

export function DailyTip({ tip, isLoading }: DailyTipProps) {
    return (
        <Card className="mt-8 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" />
                    Dica do Dia
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Analisando seu progresso para gerar uma nova dica...</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {tip}
                  </p>
                )}
            </CardContent>
        </Card>
    );
}

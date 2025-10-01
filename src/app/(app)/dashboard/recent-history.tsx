
import { Card, CardContent } from '@/components/ui/card';
import type { SessaoDeTreino } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentHistoryProps {
    history: SessaoDeTreino[];
}

export function RecentHistory({ history }: RecentHistoryProps) {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Histórico Recente</h2>
            <Card>
                <CardContent className="p-0">
                     <div className="divide-y divide-border">
                        {history.length === 0 ? (
                          <div className="p-6 text-center text-muted-foreground">
                            Você ainda não registrou nenhum treino.
                          </div>
                        ) : (
                            history.map((session) => (
                                <div key={session.id} className="p-4 flex justify-between items-center hover:bg-secondary/50 transition-colors">
                                    <div>
                                        <p className="font-semibold">{session.nome}</p>
                                        <p className="text-sm text-muted-foreground">{session.exercicios.length} exercícios &bull; +{session.xpGanho} XP</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{format(parseISO(session.data), 'd MMM, yyyy', { locale: ptBR })}</p>
                                </div>
                            ))
                        )}
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}

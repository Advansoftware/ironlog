
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideProps } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: number | string;
    description: string;
    Icon: FunctionComponent<LucideProps>;
    iconClassName?: string;
}

export function StatCard({ title, value, description, Icon, iconClassName }: StatCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{title}</span>
                    <Icon className={cn("size-5 text-primary", iconClassName)} />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

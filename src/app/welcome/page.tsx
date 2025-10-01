'use client';

import { PageHeader } from '@/components/page-header';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <PageHeader
        title="Bem-vindo ao IronLog!"
        description="Vamos construir seu plano de treino inicial."
        className="text-center"
      />
      <p className="text-muted-foreground">
        Interface da conversa com a IA será implementada aqui.
      </p>
    </div>
  );
}

    
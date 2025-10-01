
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasCompletedOnboarding } from '@/lib/storage';
import { SplashScreen } from '@/components/splash-screen';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Este efeito é executado no lado do cliente, após a montagem do componente.
    // Ele verifica se o usuário já completou o onboarding.
    if (hasCompletedOnboarding()) {
      // Se sim, redireciona para o painel principal.
      router.replace('/dashboard');
    } else {
      // Se não, redireciona para a página de boas-vindas para iniciar o processo.
      router.replace('/welcome');
    }
  }, [router]);

  // Enquanto a lógica de redirecionamento é processada, exibe a SplashScreen.
  // Isso evita qualquer piscar de tela ou renderização de conteúdo indesejado.
  return <SplashScreen />;
}

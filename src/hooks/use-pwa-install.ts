
'use client';

import { useState, useEffect } from 'react';

// Define a interface para o evento 'beforeinstallprompt' para segurança de tipo
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  // Estado para armazenar o evento que aciona o prompt de instalação
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Handler para capturar o evento 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (event: Event) => {
      // Previne que o mini-infobar do Chrome apareça em dispositivos móveis
      event.preventDefault();
      // Armazena o evento para que possa ser acionado mais tarde.
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    // Adiciona o listener quando o componente monta
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handler para limpar o prompt após a instalação
    const handleAppInstalled = () => {
      setInstallPromptEvent(null); // O app foi instalado, não precisamos mais do prompt
    };

    // Adiciona o listener para o evento 'appinstalled'
    window.addEventListener('appinstalled', handleAppInstalled);

    // Função de limpeza para remover os listeners quando o componente desmonta
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Função que será chamada pelo botão "Instalar" na UI
  const promptInstall = () => {
    if (!installPromptEvent) {
      // Se o evento não estiver disponível, não faz nada
      return;
    }
    // Mostra o prompt de instalação
    installPromptEvent.prompt();
  };

  // Retorna um booleano indicando se a instalação é possível e a função para acioná-la
  return {
    canInstall: installPromptEvent !== null,
    promptInstall,
  };
}

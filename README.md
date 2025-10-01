
# IronLog: Seu Companheiro de Treino Inteligente

Bem-vindo ao IronLog! Este é um aplicativo de planejamento e rastreamento de treinos construído com Next.js, TypeScript e TailwindCSS, potencializado com IA generativa através do Google Genkit.

## Como Começar

Para rodar este projeto localmente, siga estes passos:

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Configure as Variáveis de Ambiente:**
    *   Renomeie o arquivo `.env.example` para `.env`.
    *   Adicione sua chave de API do Google AI Studio (Gemini) à variável `GEMINI_API_KEY`. Você pode obter uma chave em [makersuite.google.com](https://makersuite.google.com).

3.  **Rode o Servidor de Desenvolvimento:**
    *   Para rodar o aplicativo Next.js:
        ```bash
        npm run dev
        ```
    *   Em um terminal separado, rode o servidor do Genkit para habilitar as funcionalidades de IA:
        ```bash
        npm run genkit:watch
        ```

4.  **Acesse o App:**
    Abra [http://localhost:9002](http://localhost:9002) no seu navegador para ver o aplicativo em ação.

## Visão Geral do Projeto

### Estrutura de Pastas

*   `src/app`: O coração do aplicativo Next.js, usando o App Router.
    *   `(app)`: Contém as páginas principais do aplicativo que compartilham o mesmo layout (dashboard, rotinas, etc.).
*   `src/ai`: Contém toda a lógica de IA.
    *   `flows`: Define os fluxos do Genkit, que são as principais funções de IA (gerar rotinas, dar dicas, etc.).
*   `src/components`: Contém os componentes React reutilizáveis.
    *   `ui`: Componentes do [shadcn/ui](https://ui.shadcn.com/), que formam a base do nosso design system.
*   `src/lib`: Contém a lógica de negócio principal e utilitários.
    *   `storage.ts`: Um módulo crucial que gerencia todo o estado da aplicação (rotinas, histórico, etc.) usando o `localStorage` do navegador. É a nossa "base de dados" do lado do cliente.
    *   `gamification.ts`: Define a lógica de níveis e cálculo de XP.
    *   `types.ts`: Define todas as interfaces TypeScript usadas no projeto.

### Como as Coisas Funcionam

*   **Gerenciamento de Estado:** Todo o estado do usuário (rotinas, histórico de treinos, XP, nível) é salvo no `localStorage` do navegador. O arquivo `src/lib/storage.ts` é o único responsável por ler e escrever esses dados, agindo como uma camada de abstração.
*   **Gamificação:** Ao completar um treino, o "volume" total (peso x séries x repetições) é convertido em **XP** (Pontos de Experiência). Acumular XP faz você subir de **nível**. Cada nível tem um nome, ícone e cor de tema próprios, que são aplicados dinamicamente à interface.
*   **Inteligência Artificial (Genkit):**
    *   **Geração de Rotinas:** A IA pode criar rotinas de treino personalizadas com base nos seus objetivos, nível e equipamento disponível.
    *   **Personal Trainer Conversacional:** Quando você sobe de nível, pode conversar com uma IA para evoluir seu plano de treino de forma inteligente.
    *   **Dica do Dia:** A IA analisa seu histórico recente para fornecer dicas personalizadas no seu painel.
*   **Componentes e Estilização:** Usamos **shadcn/ui** para componentes de alta qualidade e **TailwindCSS** para estilização. A cor primária do tema é controlada dinamicamente pela cor do seu nível atual, criando uma experiência visualmente recompensadora.

    
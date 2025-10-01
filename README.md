
# IronLog: Seu Companheiro de Treino Inteligente

![IronLog Banner](https://placehold.co/1200x630/030712/10b981/png?text=IronLog&font=inter)

**IronLog** é um aplicativo de planejamento e rastreamento de treinos de última geração, construído para ser seu personal trainer digital. Utilizando o poder da Inteligência Artificial Generativa com o Google Genkit, ele oferece uma experiência de treino personalizada, adaptativa e gamificada.

## ✨ Funcionalidades Principais

-   **🤖 Onboarding com IA:** Uma conversa inicial guiada por IA para avaliar seu nível de experiência e criar um plano de treino inicial totalmente personalizado.
-   **🏋️‍♀️ Criação de Rotinas (IA & Manual):**
    -   **Com IA:** Descreva seus objetivos, disponibilidade e equipamentos, e deixe a IA criar uma rotina otimizada para você.
    -   **Manual:** Monte seus treinos exercício por exercício, com total controle sobre séries, repetições e metas.
-   **📝 Registro de Sessões de Treino:** Uma interface intuitiva para registrar cada série, repetição e peso durante seu treino, garantindo o acompanhamento preciso do seu progresso.
-   **🏆 Gamificação e Progressão:**
    -   **XP e Níveis:** Ganhe Pontos de Experiência (XP) com base no volume total de cada treino e suba de nível.
    -   **Conquistas:** Desbloqueie medalhas por atingir marcos de consistência, volume e exploração do app.
    -   **Tema Dinâmico:** A cor primária do aplicativo muda de acordo com seu nível atual, tornando a progressão visualmente recompensadora.
-   **🧠 Evolução de Treino com IA:** Ao subir de nível, converse com o Personal Trainer IA para analisar seu progresso e evoluir seu plano de treino de forma inteligente.
-   **📊 Visualização de Progresso:** Gráficos que mostram a evolução do seu volume de treino e frequência semanal.
-   **💡 Dica do Dia com IA:** Receba uma dica diária personalizada no seu painel, gerada pela IA com base no seu histórico recente de treinos.
-   **📚 Biblioteca de Exercícios:** Navegue por uma lista completa de exercícios e adicione seus próprios exercícios personalizados.
-   **⚡ PWA (Progressive Web App):** Instale o IronLog no seu dispositivo e use-o offline. Seus dados são salvos localmente!

## 🚀 Como Começar

Para rodar este projeto localmente, siga estes passos:

### 1. Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   `npm` (geralmente instalado com o Node.js)

### 2. Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/Advansoftware/ironlog.git
cd ironlog
npm install
```

### 3. Configuração das Variáveis de Ambiente

1.  Renomeie o arquivo `.env.example` para `.env`.
2.  Adicione sua chave de API do Google AI Studio (Gemini) à variável `GEMINI_API_KEY`. Você pode obter uma chave gratuitamente em [makersuite.google.com](https://makersuite.google.com).

```.env
GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
```

### 4. Rodando o Projeto

Você precisa de **dois terminais** rodando simultaneamente:

1.  **Terminal 1: Rodar o aplicativo Next.js:**
    ```bash
    npm run dev
    ```
    O app estará disponível em `http://localhost:9002`.

2.  **Terminal 2: Rodar o servidor do Genkit (IA):**
    ```bash
    npm run genkit:watch
    ```
    Este comando inicia o servidor de desenvolvimento do Genkit e o mantém observando por mudanças nos arquivos de IA.

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src
├── ai
│   └── flows         # Lógica da IA (prompts e fluxos do Genkit)
├── app               # App Router do Next.js
│   ├── (app)         # Páginas autenticadas com layout compartilhado
│   └── welcome       # Página de onboarding
├── components        # Componentes React reutilizáveis
│   └── ui            # Componentes do ShadCN UI
├── hooks             # Hooks React personalizados (ex: useDashboard)
└── lib               # Lógica de negócio, tipos e utilitários
    ├── gamification.ts # Regras de XP, níveis e conquistas
    └── storage.ts      # Abstração para o localStorage (nosso "banco de dados")
```

### 🤖 Fluxos de Inteligência Artificial (`src/ai/flows`)

O cérebro do IronLog reside nos fluxos do Genkit, que são funções de IA especializadas para cada tarefa:

-   **`initialize-user-plan.ts`**: Conduz a conversa de onboarding. Avalia o nível do usuário e cria o primeiro conjunto de rotinas e o XP inicial.
-   **`generate-routine.ts`**: Gera uma única rotina de treino com base nas especificações do usuário (objetivo, dias, etc.).
-   **`suggest-routine-evolution.ts`**: Quando um usuário sobe de nível, este fluxo analisa o progresso e gera uma sugestão textual para iniciar a conversa de evolução.
-   **`evolve-routine-plan.ts`**: Um agente conversacional que dialoga com o usuário para modificar o plano de treino existente, podendo criar, alterar ou remover rotinas.
-   **`generate-daily-tip.ts`**: Analisa o histórico de treinos recente para gerar uma dica curta, motivacional e personalizada.
-   **`generate-progress-visualizations.ts`**: (Atualmente usado para análise textual) Fornece uma análise do progresso do usuário com base em gráficos e dados de treino.

### 💾 Gerenciamento de Estado (`src/lib/storage.ts`)

Todo o estado do aplicativo (rotinas, histórico, XP, etc.) é salvo no `localStorage` do navegador. O arquivo `src/lib/storage.ts` é a única fonte de verdade para ler e escrever esses dados. Ele funciona como uma camada de abstração, tratando o `localStorage` como um banco de dados do lado do cliente. Isso permite que o aplicativo funcione perfeitamente offline.

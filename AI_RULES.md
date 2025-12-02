# Diretrizes de Desenvolvimento (Dyad AI)

Este documento resume o stack tecnológico do projeto Nailify e estabelece regras claras para o uso de bibliotecas e estrutura de código.

## 1. Stack Tecnológico

O projeto é construído com as seguintes tecnologias principais:

*   **Framework:** React (com TypeScript).
*   **Roteamento:** React Router (mantido em `src/App.tsx`).
*   **Estilização:** Tailwind CSS (uso obrigatório para todo o design).
*   **Componentes UI:** Shadcn/ui (componentes pré-construídos e utilitários como `cn`).
*   **Ícones:** Lucide React.
*   **Backend & DB:** Supabase (utilizado para Autenticação, CRUD de dados, e armazenamento).
*   **Gerenciamento de Estado:** React Context (para `Auth` e `Nailify` data).
*   **Manipulação de Datas:** `date-fns`.
*   **Estrutura de Arquivos:** Componentes em `src/components/`, Páginas em `src/pages/`.

## 2. Regras de Uso de Bibliotecas e Estrutura

### A. Estilização e UI

1.  **Tailwind CSS:** Todos os estilos devem ser aplicados usando classes do Tailwind CSS. Priorize designs responsivos (`sm:`, `md:`, `lg:`).
2.  **Shadcn/ui:** Utilize os componentes disponíveis do Shadcn/ui para elementos comuns (botões, inputs, cards, etc.). Se um componente não existir ou precisar de customização significativa, crie um novo componente em `src/components/`.
3.  **Ícones:** Use exclusivamente o pacote `lucide-react` para todos os ícones.

### B. Dados e Backend

1.  **Supabase:** Todas as interações com o banco de dados (leitura, escrita, autenticação) devem ser feitas através do cliente `supabase` exportado em `src/lib/supabase.ts`.
2.  **Contextos:**
    *   Use `src/context/AuthContext.tsx` (via `useAuth`) para gerenciar o estado do usuário e operações de login/logout/registro.
    *   Use `src/context/NailifyContext.tsx` (via `useNailify`) para gerenciar dados específicos do negócio (Serviços, Horários, Agendamentos).

### C. Roteamento e Navegação

1.  **React Router:** Mantenha a estrutura de rotas centralizada em `src/App.tsx`.
2.  **Navegação:** Use os componentes e hooks do `react-router-dom` (`Link`, `useNavigate`, `useLocation`).

### D. Boas Práticas

1.  **Componentes:** Crie um novo arquivo para cada novo componente ou hook, mantendo os arquivos pequenos e focados.
2.  **Datas:** Use `date-fns` para formatar, comparar ou manipular datas e horários.
3.  **Feedback ao Usuário:** Use notificações (toasts) para informar o usuário sobre o sucesso ou falha de operações importantes (ex: salvar configurações, agendar).
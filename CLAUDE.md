# CLAUDE.md — LinkedCoach

> Documento de referência do projeto. Todos os agentes devem ler este arquivo antes de qualquer ação.

---

## 1. Visão geral

**LinkedCoach** é uma aplicação web satírica que transforma frases simples em posts estilo LinkedIn — cheios de frases de efeito, histórias emocionantes sem sentido e linguagem de coach motivacional. O usuário entra, digita uma ideia, define o tom e recebe um post pronto para copiar e publicar (ou rir).

**Repositório:** https://github.com/r-viana/linkedcoach.git

---

## 2. Stack técnica

| Camada  | Tecnologia |
|---------|-------------|
|Frontend | React 18 + Vite |
| Backend | API Routes do Vercel (serverless, Node.js) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth — Google OAuth, GitHub OAuth, Email/senha |
| IA (geração) | Groq API → Google Gemini API → Hugging Face (fallback em cascata) |
| Hospedagem | Vercel (plano gratuito) |
| Estilização | CSS Modules + variáveis CSS (sem lib de componentes) |

---

## 3. Estrutura de pastas

```
linkedcoach/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── CloudBackground/ # Nuvens animadas CSS
│   │   ├── PostForm/        # Formulário de entrada (frase + tom)
│   │   ├── PostOutput/      # Área de resultado editável + botão copiar
│   │   ├── History/         # Lista dos últimos 20 posts
│   │   └── AuthButtons/     # Botões de login social e email
│   ├── pages/
│   │   ├── Home.jsx         # Página principal (layout wireframe)
│   │   └── Login.jsx        # Página de autenticação
│   ├── hooks/
│   │   ├── useAuth.js       # Gerencia sessão Supabase
│   │   └── useHistory.js    # CRUD do histórico no Supabase
│   ├── lib/
│   │   └── supabaseClient.js # Instância única do Supabase
│   ├── styles/
│   │   ├── global.css       # Reset, variáveis CSS, tipografia
│   │   └── clouds.css       # Animação das nuvens
│   ├── App.jsx
│   └── main.jsx
├── api/                     # API Routes Vercel (serverless)
│   └── generate.js          # Endpoint de geração de post com fallback de IAs
├── .env.local               # Variáveis de ambiente (nunca commitado)
├── .env.example             # Template das variáveis (commitado)
├── vercel.json              # Configuração do Vercel
├── vite.config.js
└── package.json
```

---

## 4. Banco de dados (Supabase)

### Tabela: `posts`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | Gerado automaticamente |
| `user_id` | uuid (FK → auth.users) | Dono do post |
| `input_phrase` | text | Frase original enviada pelo usuário |
| `tone` | varchar(140) | Tom definido pelo usuário |
| `output_post` | text | Post gerado pela IA |
| `created_at` | timestamptz | Data de criação |

### Regras de negócio do banco
- Um usuário pode ter no máximo **20 posts** salvos. Ao salvar o 21º, o mais antigo é deletado automaticamente (lógica no backend).
- Row Level Security (RLS) ativado: cada usuário acessa apenas seus próprios posts.
- Nunca expor a `service_role` key no frontend.

---

## 5. Módulos principais

### 5.1 Autenticação (`src/hooks/useAuth.js` + Supabase Auth)
- Login via Google OAuth, GitHub OAuth ou email/senha
- Sessão persistida pelo Supabase automaticamente
- Rota `/` exige autenticação — redireciona para `/login` se não autenticado
- Logout limpa a sessão Supabase

### 5.2 Formulário de entrada (`src/components/PostForm/`)
- Campo de texto livre para a frase/ideia (sem limite rígido)
- Campo de tom: textarea de no máximo 140 caracteres
- Botão "Gerar Post" — dispara chamada para `/api/generate`
- Estado de loading visível enquanto aguarda resposta

### 5.3 Geração de post (`api/generate.js`)
- Recebe `{ phrase, tone, userId }` via POST
- Monta prompt satirizando o estilo LinkedIn (ver seção 8)
- Tenta Groq → Gemini → Hugging Face em cascata
- Retorna o post gerado ou erro genérico (nunca expõe qual API falhou)
- Salva no Supabase após geração bem-sucedida
- Garante o limite de 20 posts por usuário

### 5.4 Output editável (`src/components/PostOutput/`)
- Exibe o post gerado em textarea editável
- Botão "Copiar" usa `navigator.clipboard.writeText`
- Usuário pode editar antes de copiar — as edições não são salvas de volta

### 5.5 Histórico (`src/components/History/` + `src/hooks/useHistory.js`)
- Lista os últimos 20 posts do usuário, ordem decrescente por `created_at`
- Clique em item do histórico carrega o post no output
- Scroll vertical interno no componente

---

## 6. Convenções de código

- **Componentes**: PascalCase (`PostForm.jsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.js`)
- **Funções e variáveis**: camelCase
- **CSS Modules**: mesmo nome do componente (`PostForm.module.css`)
- **API Routes**: kebab-case (`generate.js`)
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `style:`) — **descrições sempre em português**
- Sem TypeScript — JavaScript puro com JSDoc onde necessário
- Sem lib de componentes (MUI, shadcn etc.) — CSS próprio

---

## 7. Design e visual

### Paleta (variáveis CSS em `global.css`)
```css
--color-bg: #1a3a5c;          /* azul cotton candy escuro — fundo base */
--color-surface: #1e4a73;     /* superfície dos cards */
--color-surface-light: #2a5f8f; /* hover e bordas sutis */
--color-accent: #5bb8f5;      /* azul claro — destaques e botões */
--color-accent-soft: #a8d8f0; /* azul pastel suave */
--color-text: #e8f4fd;        /* texto principal */
--color-text-muted: #8ec8e8;  /* texto secundário */
--color-cloud: rgba(255,255,255,0.12); /* nuvens */
```

### Nuvens animadas (`clouds.css`)
- Formas geométricas (elipses + retângulos arredondados) em CSS puro
- 5 a 7 nuvens com tamanhos, posições e velocidades diferentes
- Animação `@keyframes` de translação horizontal — ciclo de 60s a 120s
- `opacity` entre 0.1 e 0.25 — sutis, não distraem
- Sem JavaScript, sem lib externa

### Layout (baseado no wireframe)
- **Desktop**: duas colunas — esquerda (formulário + histórico) | direita (output)
- **Mobile**: coluna única, output abaixo do formulário
- Sem framework de grid externo — CSS Grid nativo

### Tipografia
- Fonte principal: **`Nunito`** (Google Fonts) — amigável, arredondada
- Fonte de destaque/satírica: **`Bebas Neue`** — usada em títulos e no logo
- Carregadas via `@import` no `global.css`

---

## 8. Prompt de geração (instrução para a IA)

O prompt enviado para a IA deve sempre incluir:

```
Você é um gerador satírico de posts para LinkedIn. 
Escreva um post no estilo típico de coaches e empreendedores do LinkedIn: 
use frases de efeito, história pessoal emocionante (pode ser inventada), 
quebras de linha dramáticas, emojis estratégicos, moral da história no final
e um CTA (call to action) genérico.

Tom solicitado pelo usuário: {tone}
Ideia ou frase de partida: {phrase}

Retorne apenas o texto do post, sem explicações.
```

---

## 9. Variáveis de ambiente

Definidas em `.env.local` (nunca commitado). Template em `.env.example`:

```
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # apenas no backend (api/)

# IAs (fallback em cascata)
GROQ_API_KEY=
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=

# OAuth (configurados no Supabase Dashboard)
# Google e GitHub são configurados direto no Supabase — sem variável extra aqui
```

- Variáveis com prefixo `VITE_` são expostas ao frontend (apenas anon key e URL do Supabase)
- Chaves de IA e `service_role` ficam **somente** nas API Routes (backend)

---

## 10. Segurança

- RLS ativado no Supabase — usuário só acessa seus próprios dados
- `service_role` key usada apenas em `api/generate.js` (serverless, não exposta)
- Inputs sanitizados antes de montar o prompt (strip de caracteres de controle)
- Rate limiting básico por `user_id` no endpoint `/api/generate` — máximo 10 gerações por minuto
- Erros de API retornam mensagem genérica ao frontend

---

## 11. Decisões técnicas registradas

| Data | Decisão | Motivo |
|---|---|---|
| — | React + Vite | CRA abandonado; Vite é o padrão atual |
| — | API Routes Vercel | Evita backend separado; gratuito no plano Vercel |
| — | Groq → Gemini → HuggingFace | Maximizar uptime no tier gratuito |
| — | CSS puro sem lib de componentes | Leveza e controle total do visual |
| — | Supabase Auth | Integração nativa OAuth + email sem backend extra |
| — | Limite de 20 posts no backend | Evitar abuso de armazenamento gratuito |
| — | Nunito + Bebas Neue | Amigável + impacto satírico no título |

---

## 12. Restrições absolutas

- Nunca commitar `.env.local` ou qualquer arquivo com chaves reais
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` ou chaves de IA no frontend
- Nunca usar `async void` ou promises sem tratamento de erro
- Nunca escrever SQL direto no frontend — usar Supabase client
- Nunca editar a estrutura do banco sem planejar e documentar
- Nunca adicionar dependência nova sem registrar na seção 11
- Não usar libs de componentes (MUI, Chakra, shadcn etc.)
- Não usar TypeScript neste projeto

---

## 13. Fluxo principal do usuário

```
1. Acessa linkedcoach.vercel.app
        ↓
2. Não autenticado → redireciona para /login
        ↓
3. Login (Google / GitHub / email)
        ↓
4. Página principal: digita frase + tom → clica "Gerar Post"
        ↓
5. Frontend chama POST /api/generate
        ↓
6. Backend tenta Groq → Gemini → HuggingFace
        ↓
7. Post gerado → salvo no Supabase → retornado ao frontend
        ↓
8. Usuário vê o post, edita se quiser, copia
        ↓
9. Histórico atualiza com o novo post
```

---

## 14. Histórico de entregas

| Data | Descrição | Branch |
|---|---|---|
| — | — | — |

---

## 15. Cofre Obsidian — Base de Conhecimento

O cofre Obsidian é o **cérebro vivo do projeto**. Localização: `linkedcoach/linkedcoach/` (pasta `linkedcoach/` na raiz do repositório).

### Obrigações de todos os agentes

**Ao iniciar qualquer tarefa:**
1. Ler `00 - Índice.md` para orientação geral
2. Ler as notas relevantes para a tarefa (ver tabela abaixo)

**Ao concluir qualquer tarefa:**
1. Atualizar as notas afetadas (status, decisões, riscos, backlog)
2. Nunca deixar o cofre desatualizado em relação ao estado real do projeto

### Qual nota cada agente deve ler e atualizar

| Agente | Lê | Atualiza |
|--------|-----|----------|
| Arquiteto | `01 - Visão Geral`, `04 - Decisões Técnicas`, `08 - Alertas e Riscos` | `04 - Decisões Técnicas` (novas decisões) |
| Arquiteto Contrário | `04 - Decisões Técnicas`, `08 - Alertas e Riscos` | `08 - Alertas e Riscos` (novos riscos) |
| Orquestrador | `02 - Status MVP`, `08 - Alertas e Riscos` | `02 - Status MVP` (marcar tarefas concluídas) |
| Criador | `01 - Visão Geral`, `05 - Banco de Dados`, `06 - Segurança`, `07 - Prompt de Geração` | — (Orquestrador atualiza status) |
| Testador | `08 - Alertas e Riscos`, `02 - Status MVP` | `08 - Alertas e Riscos` (novos vetores encontrados) |
| Revisor | `02 - Status MVP`, `04 - Decisões Técnicas` | `02 - Status MVP` (critérios de aceite) |

### Regras do cofre

- Nunca apagar notas — editar e manter histórico
- Adicionar data nas atualizações significativas
- Usar `[[links]]` para conectar notas relacionadas
- Registrar em `03 - Backlog` qualquer ideia fora do escopo atual, em vez de implementar

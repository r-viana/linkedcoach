# PLAN.md — MVP LinkedCoach (Aplicação Completa)

**Data:** 2026-05-27
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [ ] Concluído

---

## Objetivo

Construir o MVP completo do LinkedCoach do zero: setup do projeto, banco de dados, backend de geração com fallback de IAs, autenticação via email/senha + OAuth Google/GitHub e frontend funcional com formulário, output editável e histórico.

## Módulos afetados

- `Banco` — criar tabela `posts`, ativar RLS, configurar políticas e OAuth no Supabase Dashboard
- `Backend` — criar `api/generate.js` com autenticação JWT, cascade de IAs, rate limiting e persistência
- `Frontend` — setup Vite/React, todos os componentes, páginas, hooks e estilos
- `Autenticação` — Supabase Auth com Google OAuth, GitHub OAuth e email/senha; guard de rota

---

## Subtarefas

### Setup & Configuração do Projeto

- [x] 1. Inicializar projeto com `npm create vite@latest . -- --template react` → raiz do projeto
- [x] 2. Instalar dependências: `@supabase/supabase-js`, `react-router-dom`; instalar devDependency: `vercel` (`npm i -D vercel`) → `package.json`; adicionar script `"dev": "vercel dev"` ao `package.json` — **não usar `npm run dev` do Vite para testar API routes; sempre usar `vercel dev`**
- [x] 3. Criar `vite.config.js` com configuração de build padrão (sem proxy — o `vercel dev` resolve `/api` automaticamente) → `vite.config.js`
- [ ] 3a. Executar `vercel login` e `vercel link` para vincular o projeto local ao Vercel antes de rodar `vercel dev` → terminal ⚠️ AÇÃO MANUAL DO USUÁRIO
- [x] 4. Criar `vercel.json` com rewrites das API routes e configuração de build → `vercel.json`
- [x] 5. Criar `.env.example` com todas as variáveis necessárias → `.env.example`
- [x] 6. Criar `.gitignore` incluindo `.env.local`, `node_modules`, `dist` → `.gitignore`
- [x] 7. Inicializar repositório git, adicionar remote e fazer primeiro commit → terminal

### Banco (Supabase — passos manuais + SQL)

- [ ] 8. **[MANUAL]** Criar projeto no Supabase em supabase.com e copiar `URL` e `anon key` e `service_role key`
- [ ] 9. Rodar SQL para criar tabela `posts` com todas as colunas conforme CLAUDE.md seção 4 → Supabase SQL Editor
- [ ] 10. Rodar SQL para ativar RLS e criar 3 políticas: SELECT (user_id = auth.uid()), INSERT (user_id = auth.uid()), DELETE (user_id = auth.uid()) → Supabase SQL Editor
- [ ] 11. **[MANUAL]** Configurar OAuth Google no Supabase Dashboard → Authentication → Providers → Google (requer Client ID e Secret do Google Cloud Console)
- [ ] 12. **[MANUAL]** Configurar OAuth GitHub no Supabase Dashboard → Authentication → Providers → GitHub (requer Client ID e Secret do GitHub OAuth App)
- [ ] 13. **[MANUAL — 2 momentos]** Redirect URLs no Supabase → Authentication → URL Configuration:
  - **Antes do primeiro deploy:** adicionar apenas `http://localhost:5173`
  - **Após o primeiro deploy (tarefa 42):** voltar e adicionar o domínio `https://linkedcoach-*.vercel.app` gerado pelo Vercel

### Backend

- [x] 14. Criar `api/generate.js` com estrutura base: receber POST, extrair **apenas** `{ phrase, tone }` do body — **nunca confiar em `userId` vindo do body**, mesmo que o cliente o envie → `api/generate.js`
- [x] 15. Implementar autenticação JWT: extrair token do header `Authorization: Bearer <token>`, verificar via `supabase.auth.getUser(token)` com a service_role key para obter `userId` autenticado — **este é o único `userId` válido; ignorar qualquer userId no body** → `api/generate.js`
- [x] 16. Implementar sanitização de inputs: remover caracteres de controle de `phrase` e `tone` antes de montar prompt → `api/generate.js`
- [x] 17. Implementar rate limiting em memória: `Map<userId, { count, windowStart }>`, máx 10 req/min por usuário → `api/generate.js`
- [x] 18. Implementar montagem do prompt conforme CLAUDE.md seção 8, interpolando `{tone}` e `{phrase}` → `api/generate.js`
- [x] 19. Implementar chamada à **Groq API** (modelo `llama3-8b-8192`) com timeout de 5s → `api/generate.js`
- [x] 20. Implementar fallback para **Gemini API** (`gemini-1.5-flash`, timeout 4s) se Groq falhar → `api/generate.js`
- [x] 21. Implementar fallback para **HuggingFace Inference API** — modelo `google/flan-t5-base`, timeout 8s → `api/generate.js`
- [x] 22. Implementar persistência no Supabase: salvar post gerado; se count >= 20, deletar o mais antigo primeiro → `api/generate.js`
- [x] 23. Padronizar respostas: `{ post }` em sucesso, `{ error: "Não foi possível gerar o post." }` em falha (nunca expor qual API falhou) → `api/generate.js`

### Frontend — Infraestrutura

- [x] 24. Criar `src/lib/supabaseClient.js` — instância única do Supabase usando variáveis `VITE_` → `src/lib/supabaseClient.js`
- [x] 25. Criar `src/hooks/useAuth.js` — session state, `signInWithEmail`, `signInWithGoogle`, `signInWithGitHub`, `signOut`, listener `onAuthStateChange` → `src/hooks/useAuth.js`
- [x] 26. Criar `src/hooks/useHistory.js` — `fetchHistory` (últimos 20, desc), `addToHistory` (inserir na lista local), `selectPost` (carregar no output) → `src/hooks/useHistory.js`

### Frontend — Estilos

- [x] 27. Criar `src/styles/global.css` — `@import` Google Fonts (Nunito + Bebas Neue), variáveis CSS da paleta conforme CLAUDE.md seção 7, reset básico, estilos de tipografia globais → `src/styles/global.css`
- [x] 28. Criar `src/styles/clouds.css` — 6 nuvens em CSS puro (elipses + border-radius), `@keyframes` de translação horizontal, ciclos de 60s a 120s, opacity 0.10–0.25 → `src/styles/clouds.css`

### Frontend — Componentes

- [x] 29. Criar `CloudBackground` — div com as 6 nuvens CSS, posicionamento `fixed` cobrindo tela inteira, `z-index: 0`, `pointer-events: none` → `src/components/CloudBackground/CloudBackground.jsx` + `CloudBackground.module.css`
- [x] 30. Criar `AuthButtons` — 3 modos: botão Google OAuth, botão GitHub OAuth, form email/senha (input + botão); exibe erro de autenticação abaixo → `src/components/AuthButtons/AuthButtons.jsx` + `AuthButtons.module.css`
- [x] 31. Criar `PostForm` — textarea para frase (sem limite), textarea para tom (max 140 chars com contador), botão "Gerar Post", estado de loading com spinner/texto → `src/components/PostForm/PostForm.jsx` + `PostForm.module.css`
- [x] 32. Criar `PostOutput` — textarea editável com o post gerado (ou placeholder quando vazio), botão "Copiar" com feedback visual (texto muda para "Copiado!" por 2s) via `navigator.clipboard.writeText` → `src/components/PostOutput/PostOutput.jsx` + `PostOutput.module.css`
- [x] 33. Criar `History` — lista scrollável vertical dos últimos 20 posts (exibir primeiros 60 chars do `input_phrase`), clique carrega post no output via `selectPost` do hook → `src/components/History/History.jsx` + `History.module.css`

### Frontend — Páginas e Roteamento

- [x] 34. Criar `src/pages/Login.jsx` — layout centralizado com logo + `CloudBackground` + `AuthButtons`; se já autenticado, redireciona para `/` → `src/pages/Login.jsx`
- [x] 35. Criar `src/pages/Home.jsx` — layout CSS Grid 2 colunas desktop / 1 coluna mobile; coluna esquerda: `PostForm` + `History`; coluna direita: `PostOutput`; header com email do usuário + botão logout → `src/pages/Home.jsx`
- [x] 36. Criar `src/App.jsx` — `BrowserRouter` + rotas (`/` → Home, `/login` → Login); guard de auth: rota `/` redireciona para `/login` se não autenticado → `src/App.jsx`
- [x] 37. Criar `src/main.jsx` — ponto de entrada, importa `global.css`, renderiza `<App />` → `src/main.jsx`
- [x] 38. Criar `public/favicon.svg` — ícone simples do LinkedCoach (ex: "LC" em Bebas Neue azul) → `public/favicon.svg`

### Integração & Deploy

- [x] 39. Conectar `PostForm` → `api/generate` → `PostOutput` + `History`: ao submeter, obter o token via `const { data: { session } } = await supabase.auth.getSession()` e enviar `session.access_token` no header `Authorization: Bearer <token>`; body: `{ phrase, tone }` apenas; atualizar output e histórico com retorno → `src/pages/Home.jsx`
- [ ] 40. **[MANUAL]** Criar projeto no Vercel conectado ao repositório GitHub (`r-viana/linkedcoach`)
- [ ] 41. **[MANUAL]** Configurar todas as variáveis de ambiente no painel Vercel (mesmas do `.env.example`)
- [ ] 42. Fazer push do branch `main` e verificar deploy bem-sucedido no Vercel → terminal

---

## Arquivos a criar

| Arquivo | Finalidade |
|---|---|
| `vite.config.js` | Build config + proxy dev local |
| `vercel.json` | Rewrites das API routes para Vercel |
| `.env.example` | Template de variáveis de ambiente |
| `.gitignore` | Excluir `.env.local`, `node_modules`, `dist` |
| `api/generate.js` | Endpoint serverless de geração de post |
| `src/lib/supabaseClient.js` | Instância única do cliente Supabase |
| `src/hooks/useAuth.js` | Gerenciamento de sessão e autenticação |
| `src/hooks/useHistory.js` | CRUD local do histórico de posts |
| `src/styles/global.css` | Variáveis CSS, reset, tipografia, fontes |
| `src/styles/clouds.css` | Animação das nuvens CSS |
| `src/components/CloudBackground/CloudBackground.jsx` + `.module.css` | Fundo animado |
| `src/components/AuthButtons/AuthButtons.jsx` + `.module.css` | Botões de login |
| `src/components/PostForm/PostForm.jsx` + `.module.css` | Formulário de entrada |
| `src/components/PostOutput/PostOutput.jsx` + `.module.css` | Output editável + copiar |
| `src/components/History/History.jsx` + `.module.css` | Lista de histórico |
| `src/pages/Login.jsx` | Página de autenticação |
| `src/pages/Home.jsx` | Página principal |
| `src/App.jsx` | Roteamento e guard de auth |
| `src/main.jsx` | Ponto de entrada React |
| `public/favicon.svg` | Ícone da aplicação |

## Arquivos a modificar

- `package.json` — adicionar dependências `@supabase/supabase-js` e `react-router-dom` após `npm create vite`
- `index.html` — ajustar título para "LinkedCoach" e link do favicon

---

## O que NÃO fazer

- Não expor `SUPABASE_SERVICE_ROLE_KEY` ou chaves de IA em nenhum arquivo `VITE_*`
- Não escrever lógica de validação de userId no frontend — confiar no JWT verificado no backend
- Não usar TypeScript, MUI, Chakra, shadcn ou qualquer lib de componentes
- Não salvar edições feitas pelo usuário no `PostOutput` de volta no banco
- Não retornar ao frontend qual API de IA falhou ou qual foi usada
- Não colocar SQL direto no frontend — apenas Supabase client com anon key
- Não commitar `.env.local`

---

## Critérios de aceite

- [ ] Usuário consegue criar conta com email/senha
- [ ] Usuário consegue logar com Google OAuth
- [ ] Usuário consegue logar com GitHub OAuth
- [ ] Rota `/` redireciona para `/login` quando não autenticado
- [ ] Usuário digita frase + tom e clica "Gerar Post" → post aparece no output
- [ ] Estado de loading visível durante a geração
- [ ] Post gerado aparece no histórico imediatamente
- [ ] Clique em item do histórico carrega o post no output
- [ ] Botão "Copiar" funciona e exibe feedback visual
- [ ] Ao gerar o 21º post, o mais antigo some do histórico
- [ ] Funciona em desktop (2 colunas) e mobile (1 coluna)
- [ ] Nuvens animadas visíveis no fundo sem interferir na usabilidade
- [ ] Deploy funcional no Vercel via repositório `r-viana/linkedcoach`
- [ ] Nenhuma chave sensível exposta no bundle frontend

---

## Dependências e riscos

- **OAuth Google/GitHub requer configuração manual** no Supabase Dashboard e nas plataformas dos provedores (Google Cloud Console, GitHub Settings) — nenhum agente pode fazer isso automaticamente
- **Variáveis de ambiente no Vercel** precisam ser configuradas manualmente no painel antes do primeiro deploy funcionar
- **Rate limiting em memória** (`Map`) não persiste entre instâncias serverless — funciona para contenção básica, não para uso em escala. Aceitável para o MVP
- **HuggingFace Inference API** no plano gratuito tem fila de espera; timeout pode ser alto — considerar timeout agressivo (15s) para não travar o usuário
- **CORS em dev local**: o proxy do Vite (`/api`) resolve para desenvolvimento; em produção o Vercel resolve nativamente
- **Redirect URLs OAuth**: precisam ser cadastradas tanto em `localhost:5173` quanto no domínio Vercel — esquecer isso impede o login OAuth em produção

---

## SQLs necessários (para rodar no Supabase SQL Editor)

> **Antes de testar login por email:** desabilitar confirmação de email no Supabase Dashboard → Authentication → Email → desmarcar "Confirm email". Reabilitar apenas antes de ir para produção real.

```sql
-- Criar tabela
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_phrase text not null,
  tone varchar(140),
  output_post text not null,
  created_at timestamptz not null default now()
);

-- Ativar RLS
alter table public.posts enable row level security;

-- Política: usuário lê só os próprios posts
create policy "select_own_posts" on public.posts
  for select using (auth.uid() = user_id);

-- Política: usuário insere só com seu user_id
create policy "insert_own_posts" on public.posts
  for insert with check (auth.uid() = user_id);

-- Política: usuário deleta só os próprios posts
create policy "delete_own_posts" on public.posts
  for delete using (auth.uid() = user_id);

-- Índice para query de histórico (filtra por user_id, ordena por created_at)
create index idx_posts_user_created on public.posts (user_id, created_at desc);
```

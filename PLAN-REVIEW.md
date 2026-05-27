# PLAN-REVIEW.md — Revisão Adversária do Plano

**Data:** 2026-05-27
**Plano revisado:** PLAN.md — MVP LinkedCoach (Aplicação Completa)
**Resultado:** APROVADO COM ALERTAS (críticos corrigidos na revisão)

---

## Problemas encontrados

### 🔴 Críticos (bloqueantes)

- **[Subtarefas 14 e 15 vs CLAUDE.md seção 5.3 — IDOR potencial]**
  O `CLAUDE.md` (fonte de verdade que o Criador lê primeiro) diz explicitamente: `"Recebe { phrase, tone, userId } via POST"`. O PLAN.md corrige isso na tarefa 14 (extrai apenas `phrase` e `tone` do body) e tarefa 15 (extrai `userId` do JWT), mas **não instrui o Criador a ignorar/contrariar o CLAUDE.md**. Se o Criador seguir o CLAUDE.md à risca e usar o `userId` do body sem verificar o JWT, qualquer usuário autenticado pode passar o `userId` de outro e gerar posts em seu nome — IDOR clássico. O plano precisa declarar explicitamente: `userId` NUNCA vem do body; o backend sempre usa o `userId` extraído do JWT verificado. O que vier no body deve ser ignorado.

- **[Subtarefa 3 — Dev local com API routes inviável]**
  O plano configura proxy Vite `/api → http://localhost:3000` na tarefa 3, mas `npm run dev` do Vite **não executa `api/generate.js`** — isso é serverless do Vercel. Para as API routes funcionarem localmente é obrigatório usar `vercel dev` (CLI da Vercel instalado globalmente e projeto linkado via `vercel link`). Sem isso, toda chamada a `/api/generate` retorna 404 em desenvolvimento, e o Criador vai perder horas sem entender o motivo. O plano não menciona `vercel` CLI, `vercel link` nem o script `vercel dev` em lugar nenhum. Isso **bloqueia a implementação local** das tarefas 14–23 e 39.

---

### 🟡 Alertas (documentar e monitorar)

- **[Subtarefa 21 — HuggingFace cold start incompatível com qualquer timeout razoável]**
  O plano sugere timeout de 15s para HuggingFace. Modelos como `Mistral-7B-Instruct-v0.2` no tier gratuito do HuggingFace têm cold start de 2 a 5 minutos quando o modelo está inativo. Um timeout de 15s vai sempre falhar, tornando o fallback inútil. Mitigação: usar um modelo pequeno que carrega rápido no HuggingFace (ex: `google/flan-t5-base`) ou substituir HuggingFace por outro fallback (ex: OpenRouter free tier, Cohere trial). O plano deve definir o modelo exato e validar que ele responde dentro do timeout.

- **[Subtarefa 10 — Falta índice crítico no banco]**
  O SQL gerado não cria índice em `(user_id, created_at DESC)`. A query do histórico (`SELECT ... WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`) vai fazer full table scan conforme a tabela cresce. Adicionar ao SQL: `CREATE INDEX idx_posts_user_created ON public.posts (user_id, created_at DESC);`

- **[Subtarefa 13 vs 42 — Sequência impossível: URL do Vercel exigida antes do deploy]**
  A tarefa 13 pede para cadastrar o domínio Vercel no Supabase (Redirect URLs), mas o domínio Vercel (`*.vercel.app`) só é conhecido **após o primeiro deploy** (tarefa 42). Sequência atual trava o OAuth em produção no primeiro teste. Mitigação: documentar dois momentos: (a) antes do deploy: cadastrar apenas `localhost:5173`; (b) após o primeiro deploy: voltar ao Supabase e adicionar a URL Vercel gerada.

- **[Subtarefa 25 / Tarefa 39 — Como obter o JWT no frontend não está especificado]**
  A tarefa 39 diz "chamar POST com token JWT no header" mas não instrui o Criador de onde vir esse token. No Supabase, o token é obtido via `const { data: { session } } = await supabase.auth.getSession()` e o valor é `session.access_token`. Sem essa instrução, o Criador pode implementar incorretamente (ex: enviar apenas o email do usuário, ou nada). Deve ser explicitado no plano.

- **[Subtarefa 1 / setup geral — Confirmação de email bloqueia testes]**
  O Supabase exige confirmação de email por padrão. No MVP, o primeiro teste de login via email/senha vai falhar silenciosamente (usuário criado mas não confirmado). O plano deve incluir um passo: desabilitar confirmação de email no Supabase Dashboard (Authentication → Email → Confirm email → OFF) para o ambiente de desenvolvimento/MVP.

---

### 🔵 Sugestões (opcionais)

- **[Subtarefa 2]** Adicionar `vercel` como devDependency (`npm i -D vercel`) e script `"dev": "vercel dev"` no `package.json`. Remove a confusão de usar `npm run dev` vs `vercel dev`.

- **[Subtarefa 7]** O repositório `r-viana/linkedcoach` precisa existir no GitHub antes de `git remote add`. Considerar adicionar um passo explícito: criar o repo no GitHub (via `gh repo create` ou interface web) antes de fazer o `git remote add`.

- **[Subtarefa 25]** O listener `onAuthStateChange` captura expiração de sessão automaticamente, mas o Criador deve ser instruído a não armazenar o token em nenhuma variável local — sempre buscá-lo via `getSession()` no momento da chamada, para garantir que está atualizado.

---

## Perguntas sem resposta no plano

- Qual modelo exato do HuggingFace será usado e como garantir que ele responde dentro do timeout de uma função serverless (máx 10s no Vercel free tier)?
- O Vercel free tier tem **timeout de 10 segundos** para funções serverless. Com cascade Groq (10s) + Gemini (10s), o tempo total já ultrapassa o limite. Como o plano lida com isso?
- O repositório `r-viana/linkedcoach` já existe no GitHub ou precisa ser criado?

---

## Veredicto

**[APROVADO COM ALERTAS]** — Críticos corrigidos diretamente no PLAN.md durante a revisão:

- ✅ **Item 1 corrigido:** Tarefas 14 e 15 agora explicitam que `userId` nunca vem do body; sempre do JWT verificado via `supabase.auth.getUser(token)`.
- ✅ **Item 2 corrigido:** Tarefa 2 substituída por `vercel dev` com instrução de `vercel login` + `vercel link`; proxy do Vite removido.
- ✅ **Alertas incorporados:** índice SQL adicionado, sequência Redirect URL separada em 2 momentos, aviso de confirmação de email, timeout do Vercel documentado, instrução do token JWT no frontend especificada na tarefa 39.

Prosseguir com aprovação humana e então executar `/orquestrador`.

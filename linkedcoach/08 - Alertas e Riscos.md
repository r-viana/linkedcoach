---
tags: [riscos, alertas, revisão]
---

# Alertas e Riscos — LinkedCoach

> Problemas identificados durante a revisão adversária do plano (PLAN-REVIEW.md).  
> Status: críticos corrigidos no plano. Alertas documentados aqui para monitoramento.

---

## ✅ Críticos (já corrigidos no plano)

### IDOR potencial — userId do body
**Problema:** CLAUDE.md original dizia `Recebe { phrase, tone, userId } via POST`. Se o Criador seguisse isso literalmente, qualquer usuário autenticado poderia passar o userId de outro e gerar posts em seu nome.  
**Correção:** backend extrai userId **somente** do JWT verificado. Qualquer userId no body é ignorado.  
Ver: [[06 - Segurança]] | [[04 - Decisões Técnicas]]

### Dev local sem vercel dev
**Problema:** `npm run dev` do Vite não executa `api/generate.js`. Chamadas a `/api/generate` retornam 404.  
**Correção:** usar `vercel dev` (requer `vercel login` + `vercel link` na primeira vez). Script `"dev": "vercel dev"` no `package.json`.

---

## ⚠️ Alertas (monitorar)

### HuggingFace cold start
**Problema:** modelos grandes no HuggingFace free tier têm cold start de 2-5 minutos quando inativos. Timeout de 8s vai falhar sempre.  
**Mitigação:** usar `google/flan-t5-base` — modelo pequeno, carrega rápido.  
**Risco residual:** se flan-t5 também estiver frio, o fallback falha. Considerar OpenRouter como alternativa futura.

### Timeout Vercel free tier (10s total)
**Problema:** Groq (até 10s) + Gemini (até 10s) em cascade já ultrapassa o limite.  
**Mitigação:** timeouts agressivos: Groq 5s, Gemini 4s, HuggingFace 8s (total 17s só em timeouts — na prática, respostas chegam antes).  
**Risco residual:** em pior caso, a função pode ser morta pelo Vercel antes de completar.

### Redirect URLs OAuth — sequência de 2 momentos
**Problema:** a URL do Vercel (`*.vercel.app`) só é conhecida após o primeiro deploy. Não dá para cadastrar antes.  
**Mitigação:** cadastrar `http://localhost:5173` antes do deploy; voltar ao Supabase Dashboard após o deploy e adicionar a URL Vercel gerada.  
Ver: [[05 - Banco de Dados]]

### Rate limiting em memória sem persistência
**Problema:** `Map` em memória é destruído entre instâncias serverless. Rate limiting não funciona corretamente em escala ou sob múltiplas instâncias paralelas.  
**Mitigação:** aceitável para MVP. Para produção real: usar Redis (Upstash free tier) ou rate limiting no nível do Vercel/Supabase Edge.

### Confirmação de email bloqueia testes
**Problema:** Supabase exige confirmação de email por padrão. Login email/senha falha silenciosamente no MVP.  
**Mitigação:** desativar em Authentication → Email → "Confirm email" para desenvolvimento. Reativar antes de produção real.

---

## ⚠️ Identificados no Testador (2026-05-27 — corrigidos)

### Sem limite de tamanho em `phrase` no backend
**Problema:** backend não limitava tamanho da frase; usuário poderia enviar 100k chars, desperdiçando cascata de IAs.  
**Correção:** adicionado limite de 5000 chars em `api/generate.js` após sanitização.

### Session null em handleGenerate
**Problema:** se o token expirar entre o mount e o submit, `session.access_token` lançava TypeError com mensagem enganosa.  
**Correção:** verificação explícita de `session !== null` com mensagem "Sessão expirou".

### `navigator.clipboard.writeText` sem try/catch
**Problema:** falha silenciosa em HTTP local ou permissão negada.  
**Correção:** try/catch com fallback de `textarea.select()`.

---

## ⚠️ Identificados na revisão de UX de Cadastro (2026-05-29)

### Elemento de troca de modo sem `disabled` nativo (acessibilidade teclado)
**Problema:** se `modeToggle` for implementado como `<span>` ou `<a>` com `pointer-events: none` via CSS, usuário de teclado pode trocar de modo durante `isLoading` (Tab + Enter não é bloqueado por CSS).  
**Mitigação:** usar `<button type="button" disabled>` com aparência de link via CSS. Atributo `disabled` nativo bloqueia mouse e teclado.

### Campos não limpos ao trocar de modo (UX + autoComplete)
**Problema:** trocar de modo login → signup sem limpar o campo senha deixa senha antiga visível e pode causar comportamento estranho no `autoComplete` do browser quando o atributo muda de `current-password` para `new-password`.  
**Mitigação:** chamar `setPassword('')` ao mudar de modo via `setMode`.

---

## ❓ Perguntas Ainda Abertas

- O repositório `r-viana/linkedcoach` já existe no GitHub ou precisa ser criado?
- Qual é o timeout real do Groq no tier gratuito em horários de pico?

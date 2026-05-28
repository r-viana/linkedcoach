# TEST-REPORT.md

**Data:** 2026-05-27
**Feature testada:** MVP LinkedCoach — Aplicação Completa
**Resultado geral:** APROVADO COM ALERTAS

---

## Testes funcionais

| Teste | Status | Observação |
|-------|--------|------------|
| Rota `/` sem auth redireciona para `/login` | ✓ | Guard em `Home.jsx` linha 34 |
| Rota `/login` com auth redireciona para `/` | ✓ | Guard em `Login.jsx` linha 49 |
| Rota desconhecida redireciona para `/` | ✓ | `App.jsx` rota `*` |
| Botão "Gerar Post" desabilitado com frase vazia | ✓ | `PostForm.jsx:57` — `disabled={loading \|\| !phrase.trim()}` |
| Botão "Gerar Post" desabilitado durante loading | ✓ | `generating` state controla `loading` prop |
| Contador de tom exibe chars restantes | ✓ | `toneRemaining = 140 - tone.length` |
| Contador fica vermelho abaixo de 20 chars | ✓ | `counterWarning` class aplicada |
| `maxLength={140}` no textarea de tom | ✓ | `PostForm.jsx:42` |
| Post aparece no `PostOutput` após geração | ✓ | `generatedPost` → prop `post` |
| Botão "Copiar" muda para "Copiado! ✓" por 2s | ✓ | `setTimeout(() => setCopied(false), 2000)` |
| Clique no histórico carrega post no output | ✓ | `selectPost` → `selectedPost?.output_post` |
| Post mais recente aparece no topo do histórico | ✓ | `addToHistory` faz prepend com `.slice(0, 20)` |
| Busca do histórico usa `ORDER BY created_at DESC` | ✓ | `useHistory.js:26` |
| Erro 429 (rate limit) exibido ao usuário | ✓ | `data.error` → `generateError` state |
| Post gerado retornado mesmo quando Supabase falha | ✓ | `{ post, saved: false }` ainda renderiza output |
| Autenticação OAuth usa `window.location.origin` como redirectTo | ✓ | `useAuth.js:42,47` |

Resultado: **16/16 passando** (análise estática)

---

## Vetores de segurança testados

| Vetor | Resultado | Severidade | Detalhe |
|-------|-----------|------------|---------|
| IDOR — `userId` do body | Protegido | — | `userId` extraído **somente** do JWT via `supabase.auth.getUser(token)` em `api/generate.js:388` |
| XSS — erro da API no frontend | Protegido | — | React auto-escapa strings; `{generateError}` e `{error}` são texto puro |
| XSS — post gerado no textarea | Protegido | — | `<textarea value={...}>` nunca executa HTML |
| SQL injection — inputs do usuário | Protegido | — | Supabase client usa queries parametrizadas; sem SQL manual |
| Rota `/api/generate` sem token | Protegido | — | Retorna 401 quando `authHeader` vazio (linha 367) |
| Rota `/api/generate` método GET | Protegido | — | Retorna 405 — só aceita POST |
| `SUPABASE_SERVICE_ROLE_KEY` no bundle frontend | Protegido | — | Variável sem prefixo `VITE_` — não exposta no build Vite |
| Rate limiting — spam de gerações | Protegido (básico) | — | 10 req/min por userId em Map em memória |
| Erro de IA expõe qual API falhou | Protegido | — | Resposta sempre `"Não foi possível gerar o post."` |
| Stack trace no response de erro | Protegido | — | `console.error` vai só para Vercel logs |
| RLS bypass — usuário B lendo posts do A | Protegido | — | RLS ativo; anon key no frontend; `useHistory.fetchHistory` filtra por `user_id` |

---

## Bugs e alertas identificados

### 🔴 Alerta médio — Session null crash em `handleGenerate`

**Arquivo:** [src/pages/Home.jsx:43](src/pages/Home.jsx#L43)

```js
const { data: { session } } = await supabase.auth.getSession()
Authorization: `Bearer ${session.access_token}` // TypeError se session for null
```

Se o token expirar exatamente entre o `useEffect` inicial e o momento do submit, `session` será `null` e `session.access_token` lança `TypeError`. O `catch` captura e exibe **"Erro ao gerar o post. Tente novamente."** — mensagem enganosa. O usuário não sabe que precisa fazer login novamente.

**Correção:** checar `session` antes de usar e redirecionar para `/login` se nula.

```js
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  setGenerateError('Sua sessão expirou. Faça login novamente.')
  return
}
```

---

### 🟡 Alerta médio — `handleCopy` sem try/catch

**Arquivo:** [src/components/PostOutput/PostOutput.jsx:12-15](src/components/PostOutput/PostOutput.jsx#L12)

```js
await navigator.clipboard.writeText(localPost)
setCopied(true) // nunca executado se writeText lançar
```

`navigator.clipboard.writeText` lança em: (a) HTTP puro em dev sem HTTPS, (b) permissão negada, (c) foco fora do documento. Falha silenciosa — o usuário clica "Copiar" e nada acontece, sem feedback.

**Correção:**
```js
try {
  await navigator.clipboard.writeText(localPost)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
} catch {
  setGenerateError('Não foi possível copiar. Use Ctrl+C.')
}
```

---

### 🟡 Alerta médio — `phrase` sem limite de tamanho no backend

**Arquivo:** [api/generate.js:356-361](api/generate.js#L356)

O backend valida que `phrase` não é vazio, mas não limita o tamanho. Um usuário pode enviar 500.000 caracteres, gerando um prompt gigante que:
1. Excede o context window de `llama3-8b-8192` (8192 tokens)
2. Desperdiça os 3 fallbacks em sequência
3. Consome toda a janela de 10s do Vercel

**Correção:** adicionar logo após a validação de `phrase` vazia:
```js
if (cleanPhrase.length > 5000) {
  return res.status(400).json({ error: 'A frase é muito longa. Máximo de 5000 caracteres.' })
}
```

---

### 🟡 Alerta leve — `History` sem suporte a teclado

**Arquivo:** [src/components/History/History.jsx:26-30](src/components/History/History.jsx#L26)

```jsx
<li onClick={() => onSelect(post)}>
```

Sem `tabIndex={0}`, `role="button"` ou `onKeyDown`. Usuários de teclado e leitores de tela não conseguem navegar pelo histórico.

**Correção:**
```jsx
<li
  tabIndex={0}
  role="button"
  onClick={() => onSelect(post)}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(post)}
>
```

---

### 🟡 Alerta leve — `saved: false` gera histórico fantasma

**Arquivo:** [src/pages/Home.jsx:60-66](src/pages/Home.jsx#L60)

Quando Supabase falha ao salvar (`{ post, saved: false }`), o post é adicionado ao histórico local via `addToHistory`. O usuário vê o item na lista, mas ao recarregar a página ele some. Sem feedback de que o post não foi salvo.

**Correção sugerida:** checar `data.saved !== false` antes de adicionar ao histórico, e exibir aviso: *"Post gerado mas não foi salvo no histórico."*

---

### 🟡 Alerta leve — Erro de login não limpa ao clicar em OAuth

**Arquivo:** [src/pages/Login.jsx:39](src/pages/Login.jsx#L39)

Se o login por email falha e o erro é exibido, clicar em "Entrar com Google" não limpa o estado `error`. O card fica com mensagem de erro vermelha visível enquanto o usuário aguarda o redirect OAuth.

**Correção:** chamar `setError(null)` nos handlers `onSignInWithGoogle` e `onSignInWithGitHub`.

---

### 🔵 Info — `fetchHistory` sem `fetchHistory` no array de deps do `useEffect`

**Arquivo:** [src/pages/Home.jsx:20-24](src/pages/Home.jsx#L20)

```js
useEffect(() => {
  if (user) fetchHistory(user.id)
}, [user]) // fetchHistory ausente no array
```

`fetchHistory` é estável (vem de `useState`) então não há risco de loop infinito, mas ESLint com `eslint-plugin-react-hooks` levantará warning. Em StrictMode (dev), o efeito roda duas vezes — causando 2 fetches na montagem. Inofensivo, mas gera requisições redundantes.

---

## Fluxos caóticos testados

| Cenário | Resultado | Severidade |
|---------|-----------|------------|
| Submeter form sem preencher frase | ✓ Bloqueado — botão desabilitado quando `phrase.trim()` vazio | — |
| Frase com apenas espaços em branco | ✓ Bloqueado — `!phrase.trim()` desabilita botão e `cleanPhrase` fica vazio no backend | — |
| Colar 10.000 chars no campo frase | ✗ Sem limite — enviado integralmente ao backend e às IAs | 🟡 Médio |
| Duplo clique em "Gerar Post" | ✓ Protegido — botão desabilitado durante `generating` | — |
| Tom com 141 chars | ✓ Bloqueado — `maxLength={140}` no textarea | — |
| Session expirada ao submeter | ✗ TypeError silencioso → mensagem enganosa | 🟡 Médio |
| Copiar com clipboard bloqueado | ✗ Falha silenciosa — sem feedback ao usuário | 🟡 Médio |
| Recarregar página após post `saved: false` | ✗ Post some do histórico sem aviso | 🟡 Leve |
| Navegar para URL inexistente | ✓ Redirecionado para `/` via `<Route path="*">` | — |
| Sem internet ao gerar post | ✓ `fetch` lança, catch mostra "Erro ao gerar o post" | — |

---

## Responsividade

| Largura | Status | Observação |
|---------|--------|------------|
| 320px (mobile mínimo) | ✓ | Grid de 1 coluna abaixo de 768px; `width: min(420px, 90vw)` no card de login |
| 768px (tablet) | ✓ | Breakpoint de transição 1→2 colunas em `Home.module.css` |
| 1280px (desktop) | ✓ | Layout 2 colunas ativo |

---

## Veredicto

**[APROVADO COM ALERTAS]** — Nenhum vetor crítico de segurança confirmado (IDOR, XSS, SQL injection, secrets expostos — todos protegidos). Sem bloqueadores para deploy.

**Correções recomendadas antes do deploy (ordem de prioridade):**

| # | Arquivo | Correção |
|---|---------|----------|
| 1 | [api/generate.js:411](api/generate.js#L411) | Adicionar limite de 5000 chars em `cleanPhrase` após sanitização |
| 2 | [src/pages/Home.jsx:43](src/pages/Home.jsx#L43) | Checar `session !== null` antes de `session.access_token` |
| 3 | [src/components/PostOutput/PostOutput.jsx:12](src/components/PostOutput/PostOutput.jsx#L12) | try/catch em `navigator.clipboard.writeText` |
| 4 | [src/components/History/History.jsx:26](src/components/History/History.jsx#L26) | Adicionar `tabIndex`, `role="button"` e `onKeyDown` nos items da lista |
| 5 | [src/pages/Home.jsx:60](src/pages/Home.jsx#L60) | Tratar `saved: false` com aviso ao usuário |
| 6 | [src/pages/Login.jsx:53](src/pages/Login.jsx#L53) | Limpar `error` ao iniciar fluxo OAuth |

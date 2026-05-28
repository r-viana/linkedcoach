# PLAN.md — Debug e fix do fluxo OAuth em produção

**Data:** 2026-05-28
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [x] Concluído

---

## Objetivo

Adicionar logs de diagnóstico em todas as etapas do fluxo de login (GitHub, Google, email/senha) visíveis no console do navegador (F12), e corrigir o caso em que `signInWithOAuth` retorna a URL mas não redireciona automaticamente o browser.

## Módulos afetados

- `Banco` — nenhuma alteração
- `Backend` — nenhuma alteração
- `Frontend` — `src/hooks/useAuth.js`, `src/pages/Login.jsx`, `src/components/AuthButtons/AuthButtons.jsx`
- `Autenticação` — comportamento do fluxo OAuth em produção

---

## Subtarefas

### Frontend

- [x] 1. Adicionar logs de diagnóstico em `AuthButtons.jsx` para confirmar que o clique nos botões GitHub e Google chega ao handler → `src/components/AuthButtons/AuthButtons.jsx`

- [x] 2. Adicionar logs detalhados em `useAuth.js` nas funções `signInWithGitHub` e `signInWithGoogle`, exibindo o `window.location.origin`, o `data.url` retornado pelo Supabase, e o `error` — e adicionar **redirect manual como fallback** se `data.url` existir mas o redirect automático não ocorrer → `src/hooks/useAuth.js`

- [x] 3. Adicionar logs em `Login.jsx` nos callbacks OAuth e no `onAuthStateChange` do `useAuth.js` para rastrear eventos de sessão → `src/hooks/useAuth.js` e `src/pages/Login.jsx`

---

## Detalhe técnico das mudanças

### Subtarefa 1 — `AuthButtons.jsx`

Nos botões GitHub e Google, logar o clique antes de chamar o callback:

```jsx
onClick={() => {
  console.log('[AuthButtons] clique GitHub')
  onSignInWithGitHub()
}}
```

```jsx
onClick={() => {
  console.log('[AuthButtons] clique Google')
  onSignInWithGoogle()
}}
```

---

### Subtarefa 2 — `useAuth.js` (logs + redirect manual)

```js
async function signInWithGitHub() {
  console.log('[useAuth] signInWithGitHub iniciado')
  console.log('[useAuth] redirectTo:', window.location.origin)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin },
  })

  console.log('[useAuth] signInWithOAuth resultado:', { data, error })

  if (error) {
    console.error('[useAuth] GitHub OAuth error:', error.message)
    return { error }
  }

  // Fallback: se o Supabase não redirecionou automaticamente mas retornou a URL
  if (data?.url) {
    console.log('[useAuth] redirecionando manualmente para:', data.url)
    window.location.href = data.url
  }

  return { error: null }
}
```

Mesmo padrão para `signInWithGoogle`.

---

### Subtarefa 3 — `useAuth.js` e `Login.jsx` (logs de sessão)

Em `useAuth.js`, logar eventos do `onAuthStateChange`:

```js
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  console.log('[useAuth] onAuthStateChange:', event, session?.user?.email ?? 'sem sessão')
  setSession(session)
  setLoading(false)
})
```

Em `Login.jsx`, logar o resultado dos callbacks OAuth:

```jsx
onSignInWithGitHub={async () => {
  console.log('[Login] callback GitHub iniciado')
  setError(null)
  const { error } = await signInWithGitHub()
  console.log('[Login] callback GitHub finalizado, error:', error?.message ?? 'nenhum')
  if (error) setError('Não foi possível conectar com o GitHub. Tente novamente.')
}}
```

---

## Arquivos a criar

Nenhum.

## Arquivos a modificar

- `src/components/AuthButtons/AuthButtons.jsx` — logs no onClick dos botões OAuth
- `src/hooks/useAuth.js` — logs completos + redirect manual como fallback em `signInWithGitHub` e `signInWithGoogle`
- `src/pages/Login.jsx` — logs nos callbacks OAuth

## O que NÃO fazer

- Não logar tokens, sessions ou dados sensíveis do usuário
- Não alterar o backend
- Não alterar o banco de dados
- Não remover os logs antes de confirmar o diagnóstico — serão removidos numa tarefa posterior
- Não alterar a lógica de negócio além do redirect manual

## Critérios de aceite

- [ ] Ao clicar "Entrar com GitHub" no F12 aparece: `[AuthButtons] clique GitHub`
- [ ] Em seguida aparece: `[useAuth] signInWithGitHub iniciado`
- [ ] Em seguida aparece: `[useAuth] signInWithOAuth resultado: { data: {...}, error: null }` ou com erro explícito
- [ ] Se `data.url` existir: browser redireciona para a página de autorização do GitHub
- [ ] Após autorizar no GitHub: `[useAuth] onAuthStateChange: SIGNED_IN <email>`
- [ ] Login com Google continua funcionando (sem regressão)
- [ ] Login com email/senha continua funcionando (sem regressão)

## Dependências e riscos

- Logs são temporários — devem ser removidos após diagnóstico com `/criador` ou diretamente
- O redirect manual (`window.location.href = data.url`) é seguro: a URL vem do Supabase, não do usuário
- Se o problema for de configuração externa (GitHub OAuth App, Supabase provider), os logs vão revelar `error.message` com a causa exata
- Sem risco de breaking change — mudanças são aditivas (só adicionam logs e um fallback)

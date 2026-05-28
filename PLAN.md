# PLAN.md — Fix: OAuth GitHub/Google sem feedback de erro

**Data:** 2026-05-28
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [x] Concluído

---

## Objetivo

Corrigir o fluxo OAuth do GitHub (e proteger o Google) que falha silenciosamente: quando `signInWithOAuth` retorna um erro, ele é descartado sem feedback ao usuário, fazendo a página parecer "recarregar" sem redirecionar.

## Módulos afetados

- `Banco` — nenhuma alteração
- `Backend` — nenhuma alteração
- `Frontend` — `src/hooks/useAuth.js` e `src/pages/Login.jsx`
- `Autenticação` — comportamento dos botões OAuth na tela de login

---

## Subtarefas

### Frontend

- [x] 1. Corrigir `signInWithGoogle` e `signInWithGitHub` em `useAuth.js` para capturar e retornar erros → `src/hooks/useAuth.js`
- [x] 2. Corrigir callbacks OAuth em `Login.jsx` para aguardar o retorno e expor erros ao usuário → `src/pages/Login.jsx`

### Testes

- [ ] 3. Verificar que clicar no botão GitHub com provider desabilitado exibe mensagem de erro visível
- [ ] 4. Verificar que clicar no botão Google ainda funciona (sem regressão)
- [ ] 5. Verificar que erro de email/senha continua funcionando independentemente

---

## Arquivos a criar

Nenhum.

## Arquivos a modificar

- `src/hooks/useAuth.js` — `signInWithGoogle` e `signInWithGitHub` devem retornar `{ error }` assim como `signInWithEmail` já faz
- `src/pages/Login.jsx` — callbacks do `onSignInWithGoogle` e `onSignInWithGitHub` devem fazer `await` e capturar o `error` retornado

---

## Detalhe técnico das mudanças

### `src/hooks/useAuth.js` — antes
```js
async function signInWithGitHub() {
  await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin },
  })
}
```

### `src/hooks/useAuth.js` — depois
```js
async function signInWithGitHub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin },
  })
  return { error }
}
```

Mesmo padrão para `signInWithGoogle`.

---

### `src/pages/Login.jsx` — antes
```jsx
onSignInWithGoogle={() => { setError(null); signInWithGoogle() }}
onSignInWithGitHub={() => { setError(null); signInWithGitHub() }}
```

### `src/pages/Login.jsx` — depois
```jsx
onSignInWithGoogle={async () => {
  setError(null)
  const { error } = await signInWithGoogle()
  if (error) setError(error.message)
}}
onSignInWithGitHub={async () => {
  setError(null)
  const { error } = await signInWithGitHub()
  if (error) setError(error.message)
}}
```

---

## O que NÃO fazer

- Não alterar `AuthButtons.jsx` — a estrutura dos botões está correta (fora do `<form>`)
- Não alterar o backend
- Não alterar o banco de dados
- Não adicionar dependências novas

## Critérios de aceite

- [ ] Clicar "Entrar com GitHub" redireciona para o GitHub (fluxo OAuth inicia)
- [ ] Se o provider estiver mal configurado, mensagem de erro aparece na tela de login
- [ ] Login com Google continua funcionando (sem regressão)
- [ ] Login com email/senha continua funcionando (sem regressão)
- [ ] Sem breaking changes em outros módulos

## Dependências e riscos

- Baixo risco — mudança cirúrgica em 2 arquivos, sem alteração de estrutura ou dependências
- Se o problema for apenas de configuração externa (Client ID/Secret errado no Supabase), a correção do código vai exibir o erro real em vez de falha silenciosa — facilitando o diagnóstico

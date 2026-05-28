# PLAN.md — Remoção do botão Login com GitHub

**Data:** 2026-05-28
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [x] Concluído

---

## Objetivo

Remover o botão "Entrar com GitHub" da tela de login e limpar todo o código relacionado ao GitHub OAuth, incluindo os logs de debug temporários adicionados nas sessões anteriores.

## Módulos afetados

- `Banco` — nenhuma alteração
- `Backend` — nenhuma alteração
- `Frontend` — `AuthButtons.jsx`, `Login.jsx`, `useAuth.js`
- `Autenticação` — remoção do provider GitHub (apenas frontend; Supabase pode ser desativado manualmente)

---

## Subtarefas

### Frontend

- [ ] 1. Remover botão "Entrar com GitHub" e prop `onSignInWithGitHub` de `AuthButtons.jsx` → `src/components/AuthButtons/AuthButtons.jsx`

- [ ] 2. Remover `signInWithGitHub` do destructuring de `useAuth`, remover o callback `onSignInWithGitHub` e remover os logs de debug do GitHub em `Login.jsx` → `src/pages/Login.jsx`

- [ ] 3. Remover função `signInWithGitHub` do hook `useAuth.js`, remover do objeto de retorno, e remover todos os `console.log` de debug adicionados nas sessões anteriores (Google, GitHub e `onAuthStateChange`) → `src/hooks/useAuth.js`

---

## Arquivos a criar

Nenhum.

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/components/AuthButtons/AuthButtons.jsx` | Remover botão GitHub e prop `onSignInWithGitHub` |
| `src/pages/Login.jsx` | Remover `signInWithGitHub`, callback do GitHub e logs de debug |
| `src/hooks/useAuth.js` | Remover `signInWithGitHub`, remover do export e remover todos os `console.log` |

## O que NÃO fazer

- Não remover o login com Google — continua funcionando
- Não remover o login com email/senha — continua funcionando
- Não alterar o backend
- Não alterar o banco de dados
- Não desativar o provider GitHub no Supabase Dashboard (decisão do usuário, fora do código)

## Critérios de aceite

- [ ] O botão "Entrar com GitHub" não aparece mais na tela de login
- [ ] Login com Google continua funcionando (sem regressão)
- [ ] Login com email/senha continua funcionando (sem regressão)
- [ ] Nenhum `console.log` de debug permanece nos 3 arquivos
- [ ] Nenhum erro de prop undefined ou referência quebrada no console

## Dependências e riscos

- Risco zero — remoção pura, sem lógica nova
- O provider GitHub no Supabase Dashboard pode ser desativado manualmente após a mudança (opcional)

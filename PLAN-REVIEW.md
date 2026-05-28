# PLAN-REVIEW.md — Revisão Adversária do Plano

**Data:** 2026-05-28
**Plano revisado:** PLAN.md — Fix: OAuth GitHub/Google sem feedback de erro
**Resultado:** APROVADO COM ALERTAS

---

## Problemas encontrados

### 🔴 Críticos (bloqueantes)

Nenhum.

---

### 🟡 Alertas (documentar e monitorar)

**[Subtarefa 2 — `error.message` exposto diretamente ao usuário]**

O plano propõe `setError(error.message)` onde `error` vem diretamente do Supabase. Erros OAuth do Supabase são em inglês e técnicos: `"OAuth provider not enabled"`, `"Invalid OAuth credentials"`, `"signInWithOAuth() called with unknown provider"`. O usuário leigo verá mensagens sem sentido.

**Mitigação:** o Criador deve mapear mensagens conhecidas para português antes de exibir. Exemplo:
```js
const friendlyMessage = error.message?.includes('provider') 
  ? 'Provedor não configurado. Tente outro método de login.'
  : 'Erro ao conectar. Tente novamente.'
setError(friendlyMessage)
```

---

**[Subtarefa 2 — React warning de state update em componente desmontado]**

Quando `signInWithOAuth` **tem sucesso**, o Supabase navega o browser para o GitHub. A navegação começa, mas o código em `Login.jsx` continua executando o `await` e tenta chamar `setError(null)` num componente que pode estar desmontando. Não quebra, mas gera warning no console em modo desenvolvimento.

**Mitigação:** não bloqueia o fix. O Criador pode adicionar uma flag `isMounted` via `useRef` ou simplesmente aceitar o warning em dev — em produção o componente desmonta limpo.

---

### 🔵 Sugestões (opcionais)

- Após corrigir o código, remover o arquivo `relatorio-debug-github-oauth.md` da raiz — é um artefato de debug que não deveria ser commitado junto ao código de produção.
- Considerar desabilitar os botões OAuth durante o `await` para evitar duplo clique enquanto o redirect está pendente.

---

## Perguntas sem resposta no plano

Nenhuma — plano é cirúrgico e bem especificado.

---

## Veredicto

**[APROVADO COM ALERTAS]** — Nenhum crítico. O plano identifica corretamente a causa raiz e propõe correção mínima e segura. Alertas são de UX, não de segurança ou correção.

Prosseguir para aprovação humana e então executar `/orquestrador`.

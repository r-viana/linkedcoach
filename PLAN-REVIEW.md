# PLAN-REVIEW.md — Revisão Adversária do Plano

**Data:** 2026-05-28
**Plano revisado:** PLAN.md — Debug e fix do fluxo OAuth em produção
**Resultado:** APROVADO COM ALERTAS

---

## Problemas encontrados

### 🔴 Críticos (bloqueantes)

Nenhum.

---

### 🟡 Alertas (documentar e monitorar)

**[Subtarefas 2 e 3 — conflito de edição no mesmo arquivo]**

As subtarefas 2 e 3 ambas modificam `useAuth.js`. O Criador aplica uma, depois aplica a outra no mesmo arquivo. Se executar em sequência sem ler o arquivo atualizado entre as duas, sobrescreve as mudanças da subtarefa anterior.

**Mitigação:** o Criador deve consolidar todas as mudanças em `useAuth.js` em um único passo. O Orquestrador deve garantir que a subtarefa 3 leia o arquivo após a subtarefa 2 ser concluída antes de editar.

---

**[Subtarefa 3 — email do usuário logado no console em produção]**

```js
console.log('[useAuth] onAuthStateChange:', event, session?.user?.email ?? 'sem sessão')
```

O `onAuthStateChange` dispara em toda sessão ativa — não só durante o debug. Qualquer pessoa com DevTools aberto no `linkedcoach.vercel.app` verá o email do usuário logado no console. Os logs são temporários, mas estão sendo deployados em produção.

**Mitigação:** logar apenas o `event` e um boolean `!!session`, sem o email:
```js
console.log('[useAuth] onAuthStateChange:', event, { autenticado: !!session })
```

---

**[Geral — sem subtarefa de remoção dos logs]**

O plano menciona que os logs são temporários em "Dependências e riscos", mas não existe uma subtarefa explícita para removê-los. Logs temporários em produção tendem a virar permanentes quando o desenvolvedor esquece de limpá-los.

**Mitigação:** o Criador deve adicionar uma subtarefa 4: "Após diagnóstico confirmado, remover todos os `console.log` adicionados nas subtarefas 1–3."

---

### 🔵 Sugestões (opcionais)

- **Email/senha fora do escopo:** o objetivo menciona debug em "todas as etapas de login (GitHub, Google, email/senha)" mas as subtarefas não incluem logs para o fluxo de email/senha. Se o problema estiver nele também, o debug estará incompleto. Adicionar log em `handleSignInWithEmail` e `handleSignUpWithEmail` no `Login.jsx` caso necessário.

- **Verificar `supabase.auth.getSession()` no carregamento:** o `onAuthStateChange` não dispara na carga inicial se a sessão já existir — apenas `getSession()` faz isso. Logar o resultado do `getSession()` no `useEffect` inicial revelaria se há sessão no retorno do OAuth antes do `onAuthStateChange` disparar.

---

## Perguntas sem resposta no plano

- Quando os logs forem removidos, será feito um commit e deploy separado ou junto com outra feature?

---

## Veredicto

**[APROVADO COM ALERTAS]** — Sem críticos. O redirect manual é a correção mais provável para o problema reportado e está bem planejada. Alertas são de processo (conflito de edição, limpeza de logs) e privacidade menor (email no console).

O Criador deve:
1. Consolidar todas as mudanças em `useAuth.js` em um único passo
2. Não logar o email — logar apenas `event` e `!!session`
3. Adicionar subtarefa explícita de remoção dos logs após diagnóstico

Prosseguir para aprovação humana e então executar `/orquestrador`.

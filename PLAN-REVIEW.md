# PLAN-REVIEW.md — Revisão Adversária do Plano

**Data:** 2026-05-29
**Plano revisado:** PLAN.md — UX de Cadastro com Email/Senha: Modo Explícito + Loading + Aviso de Confirmação
**Resultado:** APROVADO COM ALERTAS

---

## Problemas encontrados

### 🔴 Críticos (bloqueantes)

Nenhum.

---

### 🟡 Alertas (documentar e monitorar)

**[Subtarefa 4 — "terceiro parâmetro" é uma contradição interna do plano]**

O plano diz: *"handleSignUpWithEmail passa a receber o email como terceiro parâmetro"*. Isso está errado: olhando o código atual de `Login.jsx`, a assinatura já é `handleSignUpWithEmail(email, password)` — o email é o **primeiro** parâmetro, não o terceiro. O plano depois se contradiz corretamente na frase seguinte ("o email já é passado por `AuthButtons`… `Login.jsx` precisa capturá-lo na assinatura da função").

**Risco:** o Criador pode ler a linha errada e tentar adicionar um terceiro parâmetro à função, quebrando a interface com `AuthButtons` ou duplicando parâmetros.

**Mitigação:** o Criador deve ignorar a menção de "terceiro parâmetro" e seguir apenas a frase posterior: `email` já existe como primeiro parâmetro da função — basta trocar `setError(null)` por `setSignUpSuccess(email)` quando não há erro.

---

**[Subtarefa 1/5 — elemento HTML do `modeToggle` não especificado: risco de inacessibilidade via teclado]**

O plano descreve `.modeToggle` como "aparência de link" com `pointer-events: none` quando desabilitado. Mas não especifica qual elemento HTML usar. Se o Criador implementar como `<span onClick>` ou `<a href="#">`, desabilitar via CSS (`pointer-events: none`) **não bloqueia acesso via teclado** — Tab + Enter ainda dispara o click e permite troca de modo durante um `isLoading`.

**Risco:** usuário com teclado pode trocar de modo enquanto há uma chamada assíncrona em andamento, causando comportamento imprevisível (ex: estava fazendo signup, troca para login no meio, `isLoading` some sem completar o ciclo).

**Mitigação:** o Criador deve usar `<button type="button">` com o atributo `disabled` nativo (não CSS class) para o `modeToggle`. O atributo `disabled` bloqueia tanto mouse quanto teclado. Estilizar com CSS para parecer um link é a abordagem correta e acessível.

---

**[Subtarefa 1 — campos email e senha não são limpos ao trocar de modo]**

O plano não menciona o que acontece com os valores dos campos quando o usuário troca de modo. Isso cria dois problemas:

1. **UX:** usuário digita uma senha de login (`123456`), clica para ir ao modo cadastro — a senha velha permanece no campo. Confuso.
2. **`autoComplete` mudando com campo já preenchido:** o plano troca `autoComplete` de `"current-password"` para `"new-password"` ao mudar de modo. Alguns navegadores exibem avisos ou desconfiguram o preenchimento automático quando o `autoComplete` muda em um campo já com conteúdo.

**Mitigação:** ao trocar de modo (`setMode`), o Criador deve chamar também `setPassword('')` para limpar o campo senha. O email pode ser mantido (o usuário geralmente usa o mesmo email).

---

### 🔵 Sugestões (opcionais)

- **[Subtarefa 4 — ícone ✉ em texto puro]** O plano sugere usar `✉` (Unicode/emoji) no card de sucesso. Emojis renderizam de forma diferente por OS (Windows vs macOS vs Android). Se consistência visual importa, substituir por uma forma CSS pura (círculo com borda) ou simplesmente omitir o ícone é mais seguro. Não é bloqueante.

- **[Subtarefa 4 — campo email pré-preenchido ao voltar do card de sucesso]** Quando o usuário clica "Voltar para o login" no card de sucesso, `AuthButtons` remonta do zero com `email = ''`. Seria mais amigável que o email já visto no card de sucesso fosse pré-preenchido no input — mas exigiria passar o email para baixo como prop inicial, o que complica a interface. Melhoria de UX opcional, não bloqueante.

---

## Perguntas sem resposta no plano

- **O que acontece se o usuário já tiver uma conta e tentar fazer signup novamente?** O Supabase retorna um erro genérico (`"User already registered"` ou similar). O plano prevê que erros aparecem normalmente — comportamento correto. Mas o Criador deve verificar que a mensagem de erro do Supabase é legível em português para o usuário final.

---

## Veredicto

**[APROVADO COM ALERTAS]** — Sem críticos. O plano é coerente, escopo correto e seguro (zero impacto em backend/banco). Os dois alertas principais são acionáveis e simples de resolver durante a implementação: usar `<button disabled>` para o modeToggle e limpar a senha ao trocar de modo. O Criador deve prestar atenção especial na contradição interna da Subtarefa 4 sobre o "terceiro parâmetro".

Prosseguir para aprovação humana e então executar `/orquestrador`.

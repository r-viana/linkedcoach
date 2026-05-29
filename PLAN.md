# PLAN.md — UX de Cadastro com Email/Senha: Modo Explícito + Loading + Aviso de Confirmação

**Data:** 2026-05-29
**Solicitado por:** Ramon Vasconcelos
**Status:** [ ] Em planejamento  [x] Aprovado  [x] Em execução  [ ] Concluído

> Revisado após PLAN-REVIEW.md (2026-05-29): corrigida descrição do parâmetro email, especificado elemento HTML do modeToggle, adicionada limpeza de senha ao trocar de modo.

---

## Objetivo

O fluxo atual de cadastro com email/senha não é intuitivo: os campos de email e senha são compartilhados entre "Entrar" e "Cadastrar" sem separação visual de modo, sem loading indicator e sem avisar que o usuário receberá um e-mail de confirmação. Esta feature resolve os três problemas com mudanças exclusivamente no frontend — sem alterar backend ou banco.

---

## Módulos afetados

- `Banco` — **nenhuma alteração**
- `Backend` — **nenhuma alteração**
- `Frontend` — `AuthButtons` (JSX + CSS) e `Login.jsx`
- `Autenticação` — sem alteração na lógica; somente UX

---

## Subtarefas

### Banco
*(sem tarefas)*

### Backend
*(sem tarefas)*

### Frontend

- [x] 1. Adicionar estado `mode` ('login' | 'signup') em `AuthButtons`
  → arquivo: `src/components/AuthButtons/AuthButtons.jsx`
  - Modo padrão: `'login'`
  - Substituir os dois botões side-by-side ("Entrar" + "Cadastrar") por **um único botão primário** por modo:
    - Modo login: botão "Entrar" (`type="submit"` do form)
    - Modo signup: botão "Cadastrar" (`type="button"` que chama `onSignUpWithEmail`)
  - Adicionar elemento de troca de modo abaixo do botão — **implementar como `<button type="button">`** com aparência de link (sem background, sem borda, cor `--color-accent`). Usar o atributo HTML nativo `disabled` (não CSS class) para bloquear mouse e teclado durante `isLoading`:
    - Modo login: "Não tem conta? Cadastrar-se"
    - Modo signup: "Já tem conta? Entrar"
  - Ao chamar `setMode(novoModo)`, chamar também `setPassword('')` para limpar o campo senha (o email pode ser mantido — o usuário geralmente usa o mesmo e-mail)
  - Trocar `autoComplete` do input senha para `"current-password"` em login e `"new-password"` em signup

- [x] 2. Adicionar estado `isLoading` em `AuthButtons`
  → arquivo: `src/components/AuthButtons/AuthButtons.jsx`
  - Gerenciado localmente dentro de `AuthButtons`
  - Antes de chamar `onSignInWithEmail` ou `onSignUpWithEmail`, setar `isLoading = true`
  - Ao retornar da promessa (sucesso ou erro), setar `isLoading = false`
  - Enquanto `isLoading = true`:
    - Botão primário: `disabled`, texto muda para `"Entrando..."` ou `"Cadastrando..."`
    - Botão "Entrar com Google": `disabled`
    - Botão modeToggle: `disabled` (atributo nativo — bloqueia teclado também)
    - Inputs email e senha: `disabled`

- [x] 3. Adicionar aviso de confirmação de e-mail no modo signup
  → arquivo: `src/components/AuthButtons/AuthButtons.jsx`
  - Renderizado apenas quando `mode === 'signup'`, abaixo do campo senha
  - Texto: `"Após o cadastro, você receberá um e-mail de confirmação. Clique no link para ativar sua conta."`
  - Estilo: bloco info com tom neutro/suave (não usar cor de erro); ver classe `.hint` na subtarefa 5

- [x] 4. Adicionar `signUpSuccess` em `Login.jsx` para mostrar card de sucesso após cadastro
  → arquivo: `src/pages/Login.jsx`
  - Adicionar estado `signUpSuccess` (string com o e-mail usado, ou `null`)
  - Em `handleSignUpWithEmail(email, password)` — `email` **já é o primeiro parâmetro da função atual**, não há nada a adicionar na assinatura. Basta usar o valor que já chega:
    - Se erro: `setError(err.message)` (comportamento atual, mantido)
    - Se sucesso: substituir `setError(null)` por `setSignUpSuccess(email)`
  - Quando `signUpSuccess !== null`: substituir todo o conteúdo do card por uma tela de sucesso:
    - Sem emoji — usar elemento visual CSS simples (ex: letra "✓" em `<span>` estilizado ou apenas o texto)
    - Título: `"Verifique seu e-mail"`
    - Mensagem: `"Enviamos um link de confirmação para [email em destaque]. Após confirmar, volte aqui para entrar."`
    - Botão secundário: `"Voltar para o login"` → `setSignUpSuccess(null)` + `setError(null)`

- [x] 5. Adicionar estilos para os novos elementos
  → arquivo: `src/components/AuthButtons/AuthButtons.module.css`
  - `.hint` — caixa de aviso de confirmação: `background: var(--color-surface-light)`, borda esquerda 3px `var(--color-accent-soft)`, `padding: 10px 12px`, `font-size: 0.82rem`, `color: var(--color-text-muted)`, `border-radius: 6px`
  - `.modeToggle` — `background: none`, `border: none`, `color: var(--color-accent)`, `cursor: pointer`, `font-size: 0.875rem`, `text-align: center`, `width: 100%`, `padding: 4px 0`, `text-decoration: underline`
  - `.modeToggle:disabled` — `opacity: 0.4`, `cursor: not-allowed` (o atributo `disabled` já bloqueia eventos; o CSS só ajusta visual)
  - `.button:disabled`, `.socialButton:disabled` — `opacity: 0.6`, `cursor: not-allowed`
  - Adaptar `.actions`: remover o `flex` de dois botões lado a lado — agora é apenas o botão primário com `width: 100%`

### Testes

- [ ] 6. Verificar manualmente os fluxos:
  - Login com email/senha válidos — botão "Entrar" visível no modo padrão
  - Tentativa de login com senha errada — mensagem de erro aparece
  - Troca de modo login → signup e de volta — campo senha é limpo, email mantido
  - Signup com email novo: "Cadastrando..." visível, card de sucesso exibido com o e-mail correto
  - Signup com email já existente — mensagem de erro aparece no modo signup
  - "Voltar para o login" no card de sucesso retorna ao formulário no modo login
  - Login com Google: sem regressão
  - Tab + Enter no modeToggle enquanto `isLoading`: sem troca de modo (elemento `disabled`)
  - Inputs desabilitados durante loading: sem possibilidade de edição

---

## Arquivos a criar

*(nenhum)*

---

## Arquivos a modificar

- `src/components/AuthButtons/AuthButtons.jsx` — estados `mode` e `isLoading`, botão único por modo, modeToggle como `<button disabled>`, limpeza de senha na troca, aviso de confirmação
- `src/components/AuthButtons/AuthButtons.module.css` — `.hint`, `.modeToggle`, `:disabled`, `.actions` simplificado
- `src/pages/Login.jsx` — estado `signUpSuccess`, usar email já presente no primeiro parâmetro de `handleSignUpWithEmail`, card de sucesso condicional

---

## O que NÃO fazer

- Não criar novo componente — as mudanças cabem nos arquivos existentes
- Não alterar `useAuth.js` — a lógica de auth está correta
- Não alterar `api/generate.js` nem nenhum arquivo de backend
- Não usar libs de componentes (MUI, Chakra etc.)
- Não usar TypeScript
- Não mover `isLoading` para `Login.jsx` — responsabilidade local de `AuthButtons`
- Não exibir sucesso via `alert()` — usar card visual inline
- Não implementar modeToggle como `<span>` ou `<a>` — usar `<button type="button">` para suportar `disabled` nativo
- Não usar emoji Unicode para ícones no card de sucesso — renderiza diferente por OS

---

## Critérios de aceite

- [ ] Formulário aparece no modo **Entrar** por padrão ao acessar `/login`
- [ ] Botão modeToggle "Não tem conta? Cadastrar-se" troca para o modo **Cadastrar**
- [ ] Botão modeToggle "Já tem conta? Entrar" troca de volta para o modo **Entrar**
- [ ] Ao trocar de modo, o campo senha é limpo e o email é mantido
- [ ] No modo Cadastrar, o aviso de confirmação de e-mail aparece abaixo do campo senha
- [ ] Ao clicar "Cadastrar", botão exibe "Cadastrando..." e todos os controles ficam desabilitados (incluindo modeToggle via Tab+Enter)
- [ ] Ao clicar "Entrar", botão exibe "Entrando..." e todos os controles ficam desabilitados
- [ ] Após signup bem-sucedido, o card exibe a tela de sucesso com o e-mail do usuário
- [ ] Botão "Voltar para o login" na tela de sucesso retorna ao formulário no modo login
- [ ] Erros continuam aparecendo normalmente em ambos os modos
- [ ] Login com Google OAuth sem regressão
- [ ] Sem breaking changes nos módulos não listados
- [ ] Nenhuma chave sensível exposta no frontend

---

## Dependências e riscos

- **Supabase com "Confirm email" desabilitado (ambiente dev):** com confirmação desativada, o signup dispara `onAuthStateChange` imediatamente, o usuário é redirecionado para `/` e o card de sucesso nunca aparece. **Mitigação:** testar com confirmação habilitada — comportamento de produção. Ver `08 - Alertas e Riscos.md`.
- **Mensagem de erro do Supabase em inglês:** ao tentar cadastrar um email já existente, o Supabase pode retornar erro em inglês (`"User already registered"`). O Criador deve verificar se a mensagem exibida ao usuário é compreensível; se não, adicionar um mapeamento simples de mensagens de erro conhecidas.
- **Sem migração de banco:** feature 100% frontend. Risco zero de schema.
- **Impacto em performance:** zero — mudanças são de estado local React, sem chamadas extras.

# TEST-REPORT.md

**Data:** 2026-05-28
**Feature testada:** Redesign Visual — Glassmorphism + Nuvens Animadas
**Resultado geral:** APROVADO COM ALERTAS

---

## Testes funcionais

| Teste | Status | Observação |
|-------|--------|------------|
| Botão "Gerar Post" desabilitado com frase vazia | ✓ | `.button:disabled` preservado em `PostForm.module.css:72` |
| Botão "Copiar" desabilitado sem post | ✓ | `.copyButton:disabled` preservado em `PostOutput.module.css:55` |
| Contador de tom (max 140) | ✓ | `.counter` e `.counterWarning` preservados |
| Placeholder nos textareas | ✓ | `::placeholder` com `color` e `opacity` preservados |
| Focus em inputs muda borda | ✓ | `border-color: var(--color-accent)` em `:focus` mantido |
| Responsividade: grid 1 coluna em mobile | ✓ | `@media (max-width: 767px)` preservado |
| Variáveis CSS glassmorphism definidas no `:root` | ✓ | 8 variáveis adicionadas em `global.css:13-21` |
| `overflow-x: hidden` no body | ✓ | Adicionado em `global.css:43` — previne scroll horizontal das nuvens |
| Backdrop-filter no `.section` do History (fora do overflow-y) | ✓ | Alerta do revisor incorporado corretamente |
| Estado `itemSelected` do histórico | ✓ | `rgba(91,184,245,0.15)` com `border-left-color: var(--color-accent)` |
| Hover dos itens do histórico | ✓ | `rgba(255,255,255,0.10)` — feedback visual mantido |

Resultado: **11/11 passando**

---

## Vetores de segurança testados

| Vetor | Resultado | Severidade | Detalhe |
|-------|-----------|------------|---------|
| Mudança de lógica JS | Nenhuma | — | Apenas CSS modificado — zero impacto em segurança |
| Secrets no CSS | Protegido | — | Nenhuma chave ou valor sensível nos arquivos CSS |
| XSS via CSS injection | Não aplicável | — | CSS Modules não aceita input do usuário |
| Regressão em auth guard | Nenhuma | — | Nenhum arquivo `.jsx` de lógica modificado além de `Login.jsx` inline styles |

---

## Bugs e alertas identificados

### 🟡 Alerta — Nested `backdrop-filter` reduz eficácia do glassmorphism interno

**Arquivos:** [src/pages/Home.module.css:74-81](src/pages/Home.module.css#L74), [src/components/History/History.module.css:1-13](src/components/History/History.module.css#L1), [src/components/PostForm/PostForm.module.css:22-23](src/components/PostForm/PostForm.module.css#L22)

O `.leftColumn` tem `backdrop-filter: blur(14px)`, criando um stacking context isolado. Os elementos internos — `History.section` (`blur(14px)`) e `PostForm.textarea` (`blur(4px)`) — aplicam `backdrop-filter` sobre o stacking context do pai (já desfocado), **não sobre as nuvens diretamente**. O efeito final é vidro dentro de vidro: os elementos internos parecem mais opacos que o esperado, sem mostrar nuvens através deles.

**Não é um bug funcional** — a UI funciona normalmente. É um desvio estético do efeito pretendido para os componentes internos.

**Possível correção futura:** remover `backdrop-filter` dos elementos internos (`.section`, `.textarea`) e manter apenas nos containers externos (`.leftColumn`, `.rightColumn`). Isso preserva o glassmorphism onde importa sem criar camadas redundantes.

---

### 🟡 Alerta — Duplo padding entre `.leftColumn` e componentes internos

**Arquivo:** [src/pages/Home.module.css:79](src/pages/Home.module.css#L79)

`.leftColumn` agora tem `padding: 1.25rem`. Os componentes internos (PostForm, History) mantêm suas próprias margens e gaps. Isso resulta em padding duplo que pode deixar o layout visualmente mais comprimido, especialmente em mobile.

**Impacto:** estético. Não quebra layout nem funcionalidade.

---

### 🔵 Info — `blur(var(--glass-blur))` requer suporte a CSS custom properties em funções

**Arquivo:** [src/styles/global.css:17](src/styles/global.css#L17) usado via `blur(var(--glass-blur))` em múltiplos arquivos

Funciona em Chrome 76+, Safari 15.4+, Firefox 103+, Edge 79+. Cobertura de ~97% dos browsers em uso global. Sem fallback para browsers antigos — aceitável para o MVP.

---

## Fluxos caóticos testados (CSS)

| Cenário | Resultado | Severidade |
|---------|-----------|------------|
| Redimensionar para 320px | ✓ Grid 1 coluna, cards empilhados corretamente | — |
| Redimensionar para 768px | ✓ Transição de 1 para 2 colunas no breakpoint | — |
| Redimensionar para 1280px+ | ✓ `max-width: 1200px` limita a expansão | — |
| Scroll vertical na Home | ✓ Nuvens ficam fixas (position: fixed), conteúdo scrolla normalmente | — |
| Scroll horizontal | ✓ `overflow-x: hidden` no body previne scroll espúrio | — |
| History com scroll interno | ✓ `overflow-y: auto` na `.list` preservado; backdrop-filter na `.section` fora do overflow | — |

---

## Responsividade

| Largura | Status | Observação |
|---------|--------|------------|
| 320px | ✓ | Grid 1 coluna; cards glassmorphism empilhados; Login card `min(420px, 90vw)` se ajusta |
| 768px | ✓ | Breakpoint de transição preservado |
| 1280px | ✓ | Layout 2 colunas com glassmorphism visível |

---

## Veredicto

**[APROVADO COM ALERTAS]** — Nenhum crítico funcional ou de segurança. Dois alertas estéticos sobre nested backdrop-filter e duplo padding nos cards internos, que podem ser refinados em iteração futura se o visual não agradar. A funcionalidade completa do app está preservada.

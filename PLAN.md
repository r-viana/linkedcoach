# PLAN.md — Redesign Visual: Glassmorphism + Nuvens Animadas

**Data:** 2026-05-28
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [x] Concluído

---

## Objetivo

Redesenhar a interface visual das páginas de Login e Home com glassmorphism nos botões e cards, e tornar as nuvens animadas visíveis no fundo azul de modo que passem atrás dos elementos de conteúdo.

## Módulos afetados

- `Banco` — nenhuma alteração
- `Backend` — nenhuma alteração
- `Frontend` — CSS Modules de todos os componentes visuais, `global.css`, `clouds.css`, `Login.jsx` (inline styles)
- `Autenticação` — nenhuma alteração

---

## Subtarefas

### Frontend — Estilos base

- [x] 1. Atualizar `global.css`: adicionar variáveis CSS de glassmorphism reutilizáveis + `overflow-x: hidden` no body → `src/styles/global.css`

- [x] 2. Atualizar `clouds.css`: aumentar opacidade das 6 nuvens para 0.35–0.50 e duração para 80s–160s → `src/styles/clouds.css`

### Frontend — Cards e layout

- [x] 3. Aplicar glassmorphism no card da página de Login → `src/pages/Login.jsx`

- [x] 4. Aplicar glassmorphism no header e nas colunas da Home → `src/pages/Home.module.css`

### Frontend — Componentes

- [x] 5. Redesenhar botões em `AuthButtons.module.css` com glassmorphism → `src/components/AuthButtons/AuthButtons.module.css`

- [x] 6. Redesenhar botão "Gerar Post" e textareas do `PostForm` com glassmorphism → `src/components/PostForm/PostForm.module.css`

- [x] 7. Aplicar glassmorphism no `PostOutput` → `src/components/PostOutput/PostOutput.module.css`

- [x] 8. Aplicar glassmorphism no card do `History` (section, não items) → `src/components/History/History.module.css`

---

## Arquivos a criar

Nenhum.

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/styles/global.css` | `--color-cloud` mais visível + variáveis glassmorphism |
| `src/styles/clouds.css` | Opacidade 0.35–0.55 + velocidade 80s–160s |
| `src/pages/Login.jsx` | Card inline styles → glassmorphism |
| `src/pages/Home.module.css` | Header + colunas com glassmorphism |
| `src/components/AuthButtons/AuthButtons.module.css` | Todos os botões glassmorphism |
| `src/components/PostForm/PostForm.module.css` | Botão + textareas glassmorphism |
| `src/components/PostOutput/PostOutput.module.css` | Textarea + botão glassmorphism |
| `src/components/History/History.module.css` | Card e lista glassmorphism |

## O que NÃO fazer

- Não alterar lógica de nenhum componente — apenas CSS
- Não alterar estrutura HTML/JSX dos componentes (exceto inline styles do Login.jsx)
- Não usar JavaScript para animações — tudo em CSS puro
- Não alterar z-index do `CloudBackground` (já está correto em `z-index: 0`)
- Não adicionar novas dependências

## Critérios de aceite

- [ ] Na tela de login: nuvens brancas visíveis se movendo sobre o fundo azul escuro
- [ ] Card de login com efeito de vidro fosco (backdrop-filter: blur visível)
- [ ] Botão "Entrar com Google" com estilo glassmorphism (sem cor sólida azul)
- [ ] Na tela principal: header com glassmorphism, colunas com card translúcido
- [ ] Botão "Gerar Post" com glassmorphism
- [ ] Textareas com borda sutil e leve transparência
- [ ] Nuvens visíveis através dos cards (efeito backdrop-filter funcionando)
- [ ] Layout responsivo preservado (desktop 2 colunas / mobile 1 coluna)
- [ ] Legibilidade do texto preservada (contraste adequado sobre vidro)

## Dependências e riscos

- `backdrop-filter: blur()` não funciona no Firefox com suporte parcial — adicionar prefixo `-webkit-backdrop-filter` para Safari/Chrome. Firefox suporta desde v103, aceitável.
- Se as nuvens estiverem muito rápidas após o ajuste, revisar `animation-duration` individualmente.
- Contraste: glassmorphism pode reduzir legibilidade. Manter `color: var(--color-text)` (#e8f4fd) em todos os textos sobre vidro.
- O efeito `backdrop-filter` só funciona se o elemento glassmorphism NÃO tiver `background` opaco — verificar que nenhum background sólido sobrescreve o CSS.

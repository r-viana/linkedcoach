# PLAN.md — Fix: Nested Glassmorphism e Duplo Padding

**Data:** 2026-05-28
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [x] Concluído

---

## Objetivo

Corrigir os dois alertas visuais do TEST-REPORT do redesign glassmorphism: remover `backdrop-filter` redundante de elementos dentro de containers já desfocados, e eliminar duplo padding entre `.leftColumn` e `History.section`.

## Módulos afetados

- `Banco` — nenhuma alteração
- `Backend` — nenhuma alteração
- `Frontend` — 3 arquivos CSS: `History.module.css`, `PostForm.module.css`, `PostOutput.module.css`
- `Autenticação` — nenhuma alteração

---

## Subtarefas

### Frontend

- [x] 1. Remover `backdrop-filter` e `-webkit-backdrop-filter` do `.section` em `History.module.css`, e remover `padding` do `.section` → `src/components/History/History.module.css`

- [x] 2. Remover `backdrop-filter` e `-webkit-backdrop-filter` do `.textarea` em `PostForm.module.css` → `src/components/PostForm/PostForm.module.css`

- [x] 3. Remover `backdrop-filter` e `-webkit-backdrop-filter` do `.textarea` em `PostOutput.module.css` → `src/components/PostOutput/PostOutput.module.css`

---

## Arquivos a criar

Nenhum.

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/components/History/History.module.css` | Remove `backdrop-filter` e `padding` do `.section` |
| `src/components/PostForm/PostForm.module.css` | Remove `backdrop-filter` do `.textarea` |
| `src/components/PostOutput/PostOutput.module.css` | Remove `backdrop-filter` do `.textarea` |

## O que NÃO fazer

- Não remover `background: rgba(255,255,255,0.05)` dos elementos — manter a aparência levemente diferenciada
- Não remover `border: 1px solid var(--glass-border)` das textareas — mantém a separação visual
- Não remover `backdrop-filter` dos containers externos (`.leftColumn`, `.rightColumn`, `.header`) — esses são corretos
- Não alterar nenhum outro arquivo CSS além dos 3 listados
- Não alterar lógica JavaScript

## Critérios de aceite

- [ ] `History.section` não tem mais `backdrop-filter` nem padding próprio
- [ ] Textareas do `PostForm` e `PostOutput` não têm mais `backdrop-filter`
- [ ] Visual dos cards externos (`.leftColumn`, `.rightColumn`) preservado com glassmorphism
- [ ] Sem duplo padding ao redor do histórico
- [ ] Conteúdo das textareas legível (contraste mantido)

## Dependências e riscos

- Risco zero — remoção de propriedades CSS redundantes
- Os elementos internos mantêm aparência diferenciada via `background` semi-transparente sem blur

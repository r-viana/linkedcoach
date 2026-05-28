# PLAN.md — Refactor: Nuvens com CSS Custom Properties + Array de Configuração

**Data:** 2026-05-28
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [x] Concluído

---

## Objetivo

Substituir o sistema hardcoded de nuvens (163 linhas de CSS com classes numeradas `.cloud-1` a `.cloud-N`) por uma arquitetura data-driven: um array de configuração em `CloudBackground.jsx` controla cada nuvem via CSS Custom Properties inline, e o `clouds.css` define apenas a forma base — sem nunca precisar ser editado para adicionar/remover nuvens.

## Módulos afetados

- `Banco` — nenhuma alteração
- `Backend` — nenhuma alteração
- `Frontend` — `CloudBackground.jsx` e `clouds.css` (refactor); `CloudBackground.module.css` inalterado
- `Autenticação` — nenhuma alteração

---

## Subtarefas

### Frontend

- [x] 1. Reescrever `clouds.css`: substituir todas as classes numeradas (`.cloud-1` a `.cloud-N`) por CSS Custom Properties lidas via `var()` no seletor base `.cloud`. As propriedades por nuvem (`--cloud-w`, `--cloud-h`, `--cloud-top`, `--cloud-opacity`, `--cloud-duration`, `--cloud-delay`, `--cloud-b-w`, `--cloud-b-h`, `--cloud-b-left`, `--cloud-a-w`, `--cloud-a-h`, `--cloud-a-left`) serão injetadas inline pelo componente React → `src/styles/clouds.css`

  O CSS resultante deve ter apenas:
  - `@keyframes cloudFloat` (inalterado)
  - `.cloud` base com todas as propriedades usando `var()`
  - `.cloud::before` e `.cloud::after` usando `var()` para dimensões e posição

- [x] 2. Reescrever `CloudBackground.jsx`: substituir os 12 divs hardcoded por um array `CLOUDS` com 12+ objetos de configuração e um `.map()` que renderiza cada nuvem com `style={{ '--cloud-w': ..., ... }}` → `src/components/CloudBackground/CloudBackground.jsx`

  Array de configuração (12 nuvens variadas):
  | # | w | h | top | opacity | duration | delay | before (w×h@left) | after (w×h@left) |
  |---|---|---|-----|---------|----------|-------|-------------------|------------------|
  | 1 | 200 | 60 | 10% | 0.18 | 80s | -15s | 90×90@30 | 60×60@100 |
  | 2 | 300 | 80 | 25% | 0.14 | 100s | -40s | 120×120@50 | 80×80@160 |
  | 3 | 160 | 50 | 40% | 0.16 | 120s | -60s | 70×70@20 | 50×50@80 |
  | 4 | 250 | 70 | 55% | 0.20 | 135s | -25s | 100×100@40 | 75×75@140 |
  | 5 | 120 | 40 | 5% | 0.15 | 150s | -80s | 55×55@15 | 40×40@65 |
  | 6 | 220 | 65 | 70% | 0.22 | 160s | -50s | 95×95@35 | 65×65@120 |
  | 7 | 180 | 55 | 18% | 0.17 | 90s | -35s | 80×80@25 | 55×55@90 |
  | 8 | 280 | 75 | 60% | 0.13 | 110s | -70s | 110×110@55 | 70×70@150 |
  | 9 | 140 | 45 | 33% | 0.19 | 125s | -10s | 60×60@18 | 45×45@75 |
  | 10 | 240 | 70 | 78% | 0.16 | 145s | -55s | 105×105@45 | 72×72@135 |
  | 11 | 100 | 35 | 48% | 0.14 | 170s | -90s | 45×45@12 | 32×32@55 |
  | 12 | 320 | 85 | 85% | 0.21 | 95s | -20s | 130×130@60 | 85×85@175 |

---

## Arquivos a criar

Nenhum.

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/styles/clouds.css` | Reescrever: remover classes numeradas, usar CSS custom properties |
| `src/components/CloudBackground/CloudBackground.jsx` | Reescrever: array CLOUDS + `.map()` com style inline |

## O que NÃO fazer

- Não usar JavaScript para animar as nuvens — toda animação continua em CSS puro
- Não alterar `CloudBackground.module.css` (container fixo)
- Não usar SCSS, Less ou processadores CSS — manter CSS puro
- Não alterar nenhum outro arquivo

## Critérios de aceite

- [ ] 12 nuvens aparecem e se movem corretamente na tela
- [ ] `clouds.css` tem menos de 50 linhas e zero classes numeradas
- [ ] Para adicionar uma nova nuvem basta adicionar um objeto ao array `CLOUDS` — sem tocar no CSS
- [ ] Visual das nuvens idêntico ao estado anterior (brancas, sutis, movendo-se horizontalmente)
- [ ] Nenhuma regressão nos outros componentes

## Dependências e riscos

- CSS Custom Properties em `style=""` inline têm suporte universal em browsers modernos (Chrome 49+, Firefox 31+, Safari 9.1+)
- O `calc()` nos pseudo-elementos (`top: calc(var(--cloud-b-h) / -2)`) requer que o valor seja um número com unidade px — o Criador deve garantir que os valores passados pelo React incluam a unidade (`'90px'` e não `90`)
- Risco baixo — refactor puro sem mudança de comportamento

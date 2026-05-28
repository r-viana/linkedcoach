# PLAN.md — Fix: Nuvens Brancas e Glassmorphism Visível

**Data:** 2026-05-28
**Solicitado por:** Ramon Vasconcelos
**Status:** [x] Em planejamento  [x] Aprovado  [x] Em execução  [x] Concluído

---

## Objetivo

Corrigir três problemas visuais identificados na screenshot: (1) bug no `CloudBackground.jsx` onde a classe base `.cloud` não é aplicada nos divs, fazendo as nuvens aparecerem sem cor/sem posicionamento; (2) `--color-cloud` muito transparente para criar nuvens brancas visíveis; (3) `--glass-bg` e `--glass-blur` fracos demais para criar efeito glassmorphism perceptível.

## Módulos afetados

- `Banco` — nenhuma alteração
- `Backend` — nenhuma alteração
- `Frontend` — `CloudBackground.jsx`, `global.css`
- `Autenticação` — nenhuma alteração

---

## Subtarefas

### Frontend

- [ ] 1. Corrigir `CloudBackground.jsx`: adicionar classe `cloud` em todos os 6 divs → `src/components/CloudBackground/CloudBackground.jsx`
  - Antes: `<div className="cloud-1" />`
  - Depois: `<div className="cloud cloud-1" />`
  - Repetir para cloud-2 até cloud-6

- [ ] 2. Corrigir variáveis CSS em `global.css`:
  - `--color-cloud`: de `rgba(255,255,255,0.12)` para `rgba(255, 255, 255, 0.90)` — branco quase sólido; a opacidade individual de cada nuvem controla a sutileza
  - `--glass-bg`: de `rgba(255,255,255,0.07)` para `rgba(255, 255, 255, 0.13)` — mais visível
  - `--glass-blur`: de `14px` para `18px` — blur mais perceptível
  - `--glass-btn-bg`: de `rgba(91,184,245,0.18)` para `rgba(91,184,245,0.25)` — botões mais definidos
  → `src/styles/global.css`

- [ ] 3. Ajustar opacidades individuais das nuvens em `clouds.css` — com `--color-cloud` agora branco (0.90), reduzir opacidades para que as nuvens fiquem sutis mas claramente brancas:
  - `.cloud-1`: 0.18
  - `.cloud-2`: 0.14
  - `.cloud-3`: 0.16
  - `.cloud-4`: 0.20
  - `.cloud-5`: 0.15
  - `.cloud-6`: 0.22
  → `src/styles/clouds.css`

---

## Arquivos a criar

Nenhum.

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/components/CloudBackground/CloudBackground.jsx` | Adicionar classe `cloud` em cada div |
| `src/styles/global.css` | Corrigir `--color-cloud`, `--glass-bg`, `--glass-blur`, `--glass-btn-bg` |
| `src/styles/clouds.css` | Reduzir opacidades individuais (0.14–0.22) |

## O que NÃO fazer

- Não alterar posições, tamanhos nem animation-delay das nuvens
- Não alterar lógica JavaScript
- Não alterar CSS Modules dos componentes

## Critérios de aceite

- [ ] Nuvens aparecem brancas/claras sobre o fundo azul escuro
- [ ] Nuvens se movem horizontalmente de forma visível
- [ ] Card de login tem glassmorphism perceptível (borrada, semi-transparente)
- [ ] Botões com tint azul visível no glassmorphism
- [ ] Nuvens passam ATRÁS do card (card em z-index superior às nuvens)

## Dependências e riscos

- Risco baixo — apenas valores CSS alterados
- Com `--color-cloud` mais opaco, as opacidades individuais DEVEM ser reduzidas (feito na subtarefa 3), caso contrário as nuvens ficarão muito pesadas

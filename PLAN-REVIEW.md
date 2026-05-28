# PLAN-REVIEW.md — Revisão Adversária do Plano

**Data:** 2026-05-28
**Plano revisado:** PLAN.md — Redesign Visual: Glassmorphism + Nuvens Animadas
**Resultado:** APROVADO COM ALERTAS

---

## Problemas encontrados

### 🔴 Críticos (bloqueantes)

Nenhum.

---

### 🟡 Alertas (documentar e monitorar)

**[Subtarefas 1 e 2 — dupla amplificação de opacidade das nuvens]**

O plano manda alterar DUAS coisas ao mesmo tempo: `--color-cloud` passa de `rgba(255,255,255,0.12)` para `rgba(255,255,255,0.55)` **E** a opacity individual de cada nuvem sobe de 0.10–0.20 para 0.35–0.55. A opacidade efetiva final é multiplicativa: `0.55 × 0.55 = ~0.30`. Isso pode resultar em nuvens muito pesadas e distrativas.

**Mitigação:** o Criador deve alterar **apenas** a opacity das nuvens em `clouds.css` (manter `--color-cloud` inalterado ou com ajuste mínimo). Sugere-se opacidade entre 0.30 e 0.45 por nuvem, testando visualmente antes de commitar.

---

**[Subtarefa 8 — backdrop-filter dentro de container com overflow-y: auto]**

O `History.module.css` tem `.list { overflow-y: auto }`. Aplicar `backdrop-filter` em itens dentro de um container `overflow-y: auto` tem comportamento inconsistente no Chrome/Safari: o blur pode não capturar o conteúdo externo (nuvens) quando o scroll interno cria um novo stacking context. O efeito pode simplesmente não aparecer nos itens de histórico sem erro visível.

**Mitigação:** aplicar glassmorphism na `.section` (container externo da lista) em vez de nos `.item` individuais. A lista interna mantém `background: transparent` e o blur funciona no container pai que está fora do overflow-y.

---

**[Subtarefa 2 — ausência de `overflow-x: hidden` no body]**

As nuvens animam de `-300px` até `calc(100vw + 300px)`. Sem `overflow-x: hidden` no `body` ou `html`, a animação cria scroll horizontal na página em alguns navegadores (especialmente mobile). O `global.css` atual não tem essa regra.

**Mitigação:** o Criador deve adicionar `overflow-x: hidden` ao `body` em `global.css` junto com as demais mudanças da subtarefa 1.

---

### 🔵 Sugestões (opcionais)

- **Subtarefa 1 — variáveis glassmorphism não estão definidas:** o plano fala em "variáveis reutilizáveis" mas não especifica nomes. Sugestão de nomenclatura para consistência: `--glass-bg: rgba(255,255,255,0.07)`, `--glass-blur: 14px`, `--glass-border: rgba(255,255,255,0.15)`. O Criador deve usá-las em todos os componentes das subtarefas 3–8.

- **Performance em mobile:** `backdrop-filter: blur()` em 6+ elementos simultâneos com 6 animações CSS pode causar jank em dispositivos de entrada. Considerar aplicar glassmorphism apenas em containers principais (não em cada `.item` do histórico), o que também resolve o problema da subtarefa 8.

- **Login.jsx usa inline styles:** a subtarefa 3 modifica o objeto `styles.card` em `Login.jsx`. Para manter consistência com o padrão do projeto (CSS Modules), considerar criar `Login.module.css` — mas isso não é bloqueante, inline styles funcionam.

---

## Perguntas sem resposta no plano

- As variáveis glassmorphism criadas na subtarefa 1 serão usadas como referência nas subtarefas 3–8, ou cada subtarefa define seus próprios valores? (Impacta consistência visual.)

---

## Veredicto

**[APROVADO COM ALERTAS]** — Sem críticos. O plano é viável e correto na abordagem técnica. Os três alertas são de ajuste fino visual (opacidade dupla), comportamento de browser previsível (backdrop-filter em overflow-y) e UX mobile (scroll horizontal). O Criador deve incorporar as mitigações descritas.

Prosseguir para aprovação humana e então executar `/orquestrador`.

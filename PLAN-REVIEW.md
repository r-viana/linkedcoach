# PLAN-REVIEW.md — Revisão Adversária do Plano

**Data:** 2026-05-28
**Plano revisado:** PLAN.md — Refactor: Nuvens com CSS Custom Properties + Array de Configuração
**Resultado:** APROVADO COM ALERTAS

---

## Problemas encontrados

### 🔴 Críticos (bloqueantes)

Nenhum.

---

### 🟡 Alertas (documentar e monitorar)

**[Subtarefa 2 — tabela do PLAN.md mostra valores sem unidade, mas o CSS exige `px`]**

A tabela de configuração no plano mostra `bW: 90`, `bH: 90`, `bLeft: 30` como números sem unidade. No entanto, o CSS usa `calc(var(--cloud-b-h) / -2)` — para isso funcionar, `--cloud-b-h` precisa ser `'90px'`, não `90`. Se o Criador seguir a tabela literalmente e passar números sem unidade, o `calc()` vai produzir valor inválido e os pseudo-elementos não vão renderizar.

**Mitigação:** o Criador deve converter todos os valores de dimensão para strings com unidade `px` ao montar o objeto `style`: `'--cloud-b-h': '90px'`. Valores de porcentagem (`top`) já têm unidade implícita no dado.

---

**[Subtarefa 1 — `position: fixed` no `.cloud` base vs. z-index do container]**

O CSS atual tem `position: fixed` no `.cloud` base e o `CloudBackground.module.css` tem o container como `position: fixed; inset: 0`. Nuvens `position: fixed` são posicionadas em relação ao viewport, não ao container pai — mesmo que o container seja fixed. Isso é correto para o comportamento de nuvens cruzando a tela toda, mas o Criador deve manter `position: fixed` no `.cloud` base para preservar o comportamento. Se usar `position: absolute`, as nuvens ficariam relativas ao container e não sairiam fora dos limites.

**Mitigação:** garantir que `.cloud` mantenha `position: fixed` no novo CSS. Verificar critério de aceite após deploy.

---

### 🔵 Sugestões (opcionais)

- O plano especifica `calc(var(--cloud-b-h) / -2)` para centrar verticalmente o `::before`. Uma alternativa mais simples é passar o valor negativo já calculado como custom property `--cloud-b-top: '-45px'`, evitando a dependência do `calc()`. Mais verboso no array, mas mais seguro.

---

## Perguntas sem resposta no plano

Nenhuma — plano especificado com dados exatos para as 12 nuvens.

---

## Veredicto

**[APROVADO COM ALERTAS]** — Sem críticos. A abordagem é elegante e correta. O único risco real é a omissão de unidades `px` na subtarefa 2, mas o plano já documenta o problema. O Criador deve incluir unidades em todos os valores de dimensão ao montar o objeto `style`.

Prosseguir para aprovação humana e então executar `/orquestrador`.

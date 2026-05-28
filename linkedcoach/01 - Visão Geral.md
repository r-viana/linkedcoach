---
tags: [projeto, visão-geral]
---

# Visão Geral — LinkedCoach

> Aplicação web satírica que transforma frases simples em posts estilo LinkedIn — cheios de frases de efeito, histórias emocionantes sem sentido e linguagem de coach motivacional.

**Repositório:** https://github.com/r-viana/linkedcoach.git  
**Deploy:** Vercel (plano gratuito)

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + Vite |
| Backend | API Routes Vercel (serverless, Node.js) |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth — Google OAuth, GitHub OAuth, Email/senha |
| IA (geração) | Groq → Gemini → Hugging Face (fallback em cascata) |
| Estilização | CSS Modules + variáveis CSS (sem lib de componentes) |

---

## Fluxo Principal do Usuário

```
1. Acessa linkedcoach.vercel.app
2. Não autenticado → redireciona para /login
3. Login (Google / GitHub / email)
4. Digita frase + tom → clica "Gerar Post"
5. Frontend chama POST /api/generate com JWT no header
6. Backend valida JWT → tenta Groq → Gemini → HuggingFace
7. Post gerado → salvo no Supabase → retornado ao frontend
8. Usuário vê o post, edita se quiser, copia
9. Histórico atualiza com o novo post
```

---

## Estrutura de Pastas

```
linkedcoach/
├── public/favicon.svg
├── src/
│   ├── components/
│   │   ├── CloudBackground/
│   │   ├── PostForm/
│   │   ├── PostOutput/
│   │   ├── History/
│   │   └── AuthButtons/
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── Login.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useHistory.js
│   ├── lib/supabaseClient.js
│   └── styles/
│       ├── global.css
│       └── clouds.css
└── api/generate.js
```

---

## Design — Paleta de Cores

```css
--color-bg: #1a3a5c;           /* azul escuro — fundo base */
--color-surface: #1e4a73;      /* superfície dos cards */
--color-accent: #5bb8f5;       /* azul claro — botões e destaques */
--color-text: #e8f4fd;         /* texto principal */
--color-text-muted: #8ec8e8;   /* texto secundário */
```

**Fontes:** `Nunito` (corpo) + `Bebas Neue` (títulos e logo)

---

## Convenções

- Componentes: PascalCase (`PostForm.jsx`)
- Hooks: camelCase com prefixo `use`
- CSS: Modules com mesmo nome do componente
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`)
- Sem TypeScript. Sem libs de componentes.

---

Ver também: [[05 - Banco de Dados]] | [[06 - Segurança]] | [[07 - Prompt de Geração]]

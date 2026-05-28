---
tags: [decisões, arquitetura, adr]
---

# Decisões Técnicas — LinkedCoach

> Registro de cada decisão arquitetural importante: o quê, por quê e trade-offs.

---

## React + Vite
**Decisão:** usar React 18 com Vite como bundler.  
**Por quê:** CRA (Create React App) foi abandonado; Vite é o padrão atual para projetos React novos — build mais rápido, HMR instantâneo.  
**Trade-off:** requer configuração mínima manual; sem ejeção de webpack.

---

## API Routes Vercel (serverless)
**Decisão:** backend como funções serverless na pasta `api/`.  
**Por quê:** evita manter um servidor separado (Express, FastAPI etc.); plano gratuito do Vercel cobre o uso esperado no MVP.  
**Trade-off:** rate limiting em memória não persiste entre instâncias; timeout máximo de 10s nas funções free tier — ver [[08 - Alertas e Riscos]].

---

## Cascade de IAs: Groq → Gemini → HuggingFace
**Decisão:** tentar Groq primeiro; se falhar, Gemini; se falhar, HuggingFace.  
**Por quê:** maximizar uptime no tier gratuito de cada provedor; nenhum provider free tier é 100% confiável.  
**Trade-off:** latência total pode chegar perto do timeout de 10s do Vercel se Groq e Gemini falharem. HuggingFace tem cold start longo — usar modelo pequeno (`flan-t5-base`).

---

## CSS puro sem lib de componentes
**Decisão:** CSS Modules + variáveis CSS, sem MUI / Chakra / shadcn.  
**Por quê:** leveza do bundle; controle total do visual satírico; sem overhead de aprendizado de API de lib.  
**Trade-off:** mais CSS manual; sem componentes prontos acessíveis.

---

## Supabase Auth
**Decisão:** usar Supabase Auth para Google OAuth, GitHub OAuth e email/senha.  
**Por quê:** integração nativa OAuth + email sem precisar de backend extra; RLS integrado ao banco.  
**Trade-off:** vendor lock-in no Supabase; migração futura requer reescrever auth.

---

## Limite de 20 posts no backend
**Decisão:** ao inserir o 21º post, deletar o mais antigo automaticamente.  
**Por quê:** evitar abuso de armazenamento gratuito no Supabase.  
**Trade-off:** usuário perde posts antigos sem aviso explícito (comportamento deve ser documentado na UI futuramente).

---

## JWT verificado no backend, nunca userId do body
**Decisão:** o backend extrai `userId` **somente** do JWT via `supabase.auth.getUser(token)`. Qualquer `userId` enviado no body é ignorado.  
**Por quê:** previne IDOR — sem essa verificação, usuário autenticado poderia passar userId de outro e gerar posts em seu nome.  
**Trade-off:** nenhum — é a única abordagem correta.

---

## `vercel dev` para desenvolvimento local
**Decisão:** usar `vercel dev` ao invés de `npm run dev` do Vite puro.  
**Por quê:** `npm run dev` do Vite não executa as API routes serverless. Sem `vercel dev`, toda chamada a `/api/generate` retorna 404 em desenvolvimento.  
**Trade-off:** requer `vercel login` + `vercel link` na primeira vez.

---

## Nunito + Bebas Neue
**Decisão:** Nunito para corpo de texto; Bebas Neue para títulos e logo.  
**Por quê:** Nunito é amigável e arredondada (combina com o tom descontraído); Bebas Neue é impactante e dramática (reforça a sátira).  
**Trade-off:** duas fontes Google adicionais no bundle (impacto mínimo).

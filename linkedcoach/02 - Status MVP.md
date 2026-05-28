---
tags: [status, mvp, progresso]
---

# Status MVP — LinkedCoach

> Rastreamento das 42 tarefas do plano de execução.  
> Atualizar conforme cada tarefa for concluída.

**Última atualização:** 2026-05-27  
**Status geral:** 🟡 Em progresso — código completo, aguardando configuração manual (Supabase + Vercel)

---

## Setup & Configuração

- [x] 1. Inicializar projeto com `npm create vite@latest`
- [x] 2. Instalar deps: `@supabase/supabase-js`, `react-router-dom`, `vercel` (dev); script `"dev": "vercel dev"`
- [x] 3. Criar `vite.config.js` (sem proxy — Vercel resolve `/api`)
- [ ] 3a. Executar `vercel login` + `vercel link` ⚠️ MANUAL
- [x] 4. Criar `vercel.json` com rewrites das API routes
- [x] 5. Criar `.env.example`
- [x] 6. Criar `.gitignore`
- [x] 7. Inicializar git + remote + primeiro commit

---

## Banco (Supabase — passos manuais)

- [ ] 8. **[MANUAL]** Criar projeto no Supabase, copiar URL + anon key + service_role key
- [ ] 9. Rodar SQL — criar tabela `posts` + índice
- [ ] 10. Rodar SQL — ativar RLS + criar 3 políticas
- [ ] 11. **[MANUAL]** Configurar OAuth Google no Supabase Dashboard
- [ ] 12. **[MANUAL]** Configurar OAuth GitHub no Supabase Dashboard
- [ ] 13. **[MANUAL — 2 momentos]** Redirect URLs: `localhost:5173` agora; domínio Vercel após deploy

---

## Backend

- [x] 14. Criar `api/generate.js` — extrair **só** `{ phrase, tone }` do body (nunca `userId`)
- [x] 15. Implementar auth JWT — `supabase.auth.getUser(token)` → único `userId` válido
- [x] 16. Sanitizar inputs (strip caracteres de controle)
- [x] 17. Rate limiting em memória — `Map<userId>`, máx 10 req/min
- [x] 18. Montar prompt conforme [[07 - Prompt de Geração]]
- [x] 19. Chamada Groq API (`llama3-8b-8192`, timeout 5s)
- [x] 20. Fallback Gemini API (`gemini-1.5-flash`, timeout 4s)
- [x] 21. Fallback HuggingFace (`google/flan-t5-base`, timeout 8s) ⚠️ ver [[08 - Alertas e Riscos]]
- [x] 22. Persistência Supabase — salvar post; se count ≥ 20, deletar o mais antigo
- [x] 23. Padronizar respostas: `{ post }` ou `{ error: "Não foi possível gerar o post." }` — ✅ 2026-05-27

---

## Frontend — Infraestrutura

- [x] 24. `src/lib/supabaseClient.js`
- [x] 25. `src/hooks/useAuth.js` — session, signIn (email/Google/GitHub), signOut
- [x] 26. `src/hooks/useHistory.js` — fetchHistory, addToHistory, selectPost

---

## Frontend — Estilos

- [x] 27. `src/styles/global.css` — variáveis CSS, reset, fontes Google
- [x] 28. `src/styles/clouds.css` — 6 nuvens animadas CSS puro

---

## Frontend — Componentes

- [x] 29. `CloudBackground` — fundo fixo, z-index: 0, pointer-events: none
- [x] 30. `AuthButtons` — Google OAuth, GitHub OAuth, form email/senha
- [x] 31. `PostForm` — textarea frase + textarea tom (max 140, contador) + botão + loading
- [x] 32. `PostOutput` — textarea editável + botão "Copiar" com feedback "Copiado!" 2s
- [x] 33. `History` — lista scrollável, click carrega no output

---

## Frontend — Páginas

- [x] 34. `src/pages/Login.jsx` — layout centralizado + redirect se autenticado
- [x] 35. `src/pages/Home.jsx` — grid 2 colunas desktop / 1 mobile
- [x] 36. `src/App.jsx` — rotas + guard de auth
- [x] 37. `src/main.jsx` — ponto de entrada
- [x] 38. `public/favicon.svg`

---

## Integração & Deploy

- [x] 39. Conectar PostForm → `/api/generate` → PostOutput + History (token via `getSession()`)
- [ ] 40. **[MANUAL]** Criar projeto Vercel conectado ao repo GitHub
- [ ] 41. **[MANUAL]** Configurar variáveis de ambiente no painel Vercel
- [ ] 42. Push `main` + verificar deploy

---

## Critérios de Aceite

- [ ] Login email/senha funciona
- [ ] Login Google OAuth funciona
- [ ] Login GitHub OAuth funciona
- [ ] Rota `/` redireciona para `/login` sem auth
- [ ] Gerar post funciona (frase + tom → output)
- [ ] Loading visível durante geração
- [ ] Post aparece no histórico imediatamente
- [ ] Click no histórico carrega post
- [ ] Botão Copiar funciona com feedback visual
- [ ] 21º post deleta o mais antigo
- [ ] Layout responsivo (desktop 2 colunas / mobile 1 coluna)
- [ ] Nuvens animadas visíveis
- [ ] Deploy funcional no Vercel
- [ ] Nenhuma chave sensível no bundle frontend

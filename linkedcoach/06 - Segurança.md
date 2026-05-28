---
tags: [segurança, restrições]
---

# Segurança — LinkedCoach

---

## Restrições Absolutas

- **Nunca** commitar `.env.local` ou qualquer arquivo com chaves reais
- **Nunca** expor `SUPABASE_SERVICE_ROLE_KEY` ou chaves de IA no frontend (variáveis `VITE_*`)
- **Nunca** usar `async void` ou promises sem tratamento de erro
- **Nunca** escrever SQL direto no frontend — usar Supabase client com anon key
- **Nunca** editar a estrutura do banco sem planejar e documentar em [[05 - Banco de Dados]]
- **Nunca** adicionar dependência nova sem registrar em [[04 - Decisões Técnicas]]
- **Nunca** usar libs de componentes (MUI, Chakra, shadcn etc.)
- **Nunca** usar TypeScript neste projeto

---

## Proteções Implementadas

### IDOR — Proteção contra Broken Object Level Authorization
O backend extrai `userId` **somente** do JWT verificado via `supabase.auth.getUser(token)`.  
Qualquer `userId` enviado no body da requisição é **ignorado completamente**.  
Ver decisão em [[04 - Decisões Técnicas]].

### RLS — Row Level Security
Ativado na tabela `posts`. Cada usuário acessa apenas seus próprios registros.  
Políticas: SELECT, INSERT, DELETE todas verificam `auth.uid() = user_id`.

### Rate Limiting
Máximo 10 gerações por minuto por `userId`.  
Implementado em memória com `Map<userId, { count, windowStart }>` no `api/generate.js`.  
⚠️ Não persiste entre instâncias serverless — contenção básica, não escala.

### Sanitização de Inputs
`phrase` e `tone` têm caracteres de controle removidos antes de montar o prompt.

### Erros Opacos
Retornar sempre `{ error: "Não foi possível gerar o post." }` em falhas.  
Nunca expor qual API de IA falhou, qual modelo foi usado, ou detalhes internos.

---

## Variáveis de Ambiente

| Variável | Onde fica | Exposição |
|----------|-----------|-----------|
| `VITE_SUPABASE_URL` | Frontend | Pública (anon key) |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Pública (RLS protege) |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas `api/` | **Nunca no frontend** |
| `GROQ_API_KEY` | Apenas `api/` | **Nunca no frontend** |
| `GEMINI_API_KEY` | Apenas `api/` | **Nunca no frontend** |
| `HUGGINGFACE_API_KEY` | Apenas `api/` | **Nunca no frontend** |

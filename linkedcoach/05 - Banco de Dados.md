---
tags: [banco, supabase, sql, schema]
---

# Banco de Dados — LinkedCoach

> Supabase (PostgreSQL). RLS ativado. Service role key usada apenas no backend.

---

## Tabela: `posts`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid (PK) | `gen_random_uuid()` — gerado automaticamente |
| `user_id` | uuid (FK → auth.users) | Dono do post; cascade delete |
| `input_phrase` | text | Frase original enviada pelo usuário |
| `tone` | varchar(140) | Tom definido pelo usuário |
| `output_post` | text | Post gerado pela IA |
| `created_at` | timestamptz | `now()` — data de criação |

---

## Regras de Negócio

- Máximo **20 posts por usuário**. Ao salvar o 21º, o mais antigo é deletado automaticamente (lógica no backend, não trigger SQL).
- RLS ativado: cada usuário acessa **apenas seus próprios posts**.
- `service_role` key usada **apenas** em `api/generate.js` — nunca exposta ao frontend.

---

## SQL Completo

```sql
-- Criar tabela
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_phrase text NOT NULL,
  tone varchar(140),
  output_post text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Política: usuário lê só os próprios posts
CREATE POLICY "select_own_posts" ON public.posts
  FOR SELECT USING (auth.uid() = user_id);

-- Política: usuário insere só com seu user_id
CREATE POLICY "insert_own_posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuário deleta só os próprios posts
CREATE POLICY "delete_own_posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Índice para query de histórico
CREATE INDEX idx_posts_user_created ON public.posts (user_id, created_at DESC);
```

> Rodar no **Supabase SQL Editor**.

---

## Query de Histórico

```sql
SELECT id, input_phrase, tone, output_post, created_at
FROM public.posts
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 20;
```

---

## Configuração OAuth (Supabase Dashboard)

- **Authentication → Providers → Google** — Client ID + Secret do Google Cloud Console
- **Authentication → Providers → GitHub** — Client ID + Secret do GitHub OAuth App
- **Authentication → URL Configuration → Redirect URLs:**
  - Fase 1 (antes do deploy): `http://localhost:5173`
  - Fase 2 (após primeiro deploy): adicionar `https://linkedcoach-*.vercel.app`
- **Authentication → Email → Confirm email:** desativar para desenvolvimento/MVP

---

Ver também: [[06 - Segurança]] | [[08 - Alertas e Riscos]]

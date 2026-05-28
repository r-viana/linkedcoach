/**
 * api/generate.js — Vercel Serverless Function
 *
 * POST /api/generate
 * Body: { phrase: string, tone: string }
 * Header: Authorization: Bearer <supabase-jwt>
 *
 * Pipeline:
 *   1. Validate method + CORS
 *   2. Parse + validate body (phrase, tone) — userId NEVER from body (IDOR risk)
 *   3. Verify JWT → extract userId from Supabase Auth
 *   4. Sanitize inputs (strip control characters)
 *   5. Rate-limit: max 10 req/min per userId (in-memory, best-effort)
 *   6. Build satirical LinkedIn prompt
 *   7. Try Groq → Gemini → HuggingFace (cascade)
 *   8. Enforce 20-post limit, save to Supabase
 *   9. Return { post } on success, { error: "..." } on any failure
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase admin client (service_role — never exposed to frontend)
// ---------------------------------------------------------------------------
function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase env vars');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// In-memory rate limiter — Map<userId, { count: number, windowStart: number }>
// Not shared across serverless instances; provides basic per-instance limiting.
// ---------------------------------------------------------------------------
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(userId) {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // First request or window expired — open a new window
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }

  entry.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Input sanitization — strip ASCII control characters (0x00–0x1F, 0x7F)
// except tab (0x09), newline (0x0A), carriage return (0x0D)
// ---------------------------------------------------------------------------
function sanitize(str) {
  if (typeof str !== 'string') return '';
  // Remove control chars except \t \n \r
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
function buildPrompt(phrase, tone) {
  return `Você é um gerador satírico de posts para LinkedIn.

Escreva um post no estilo típico de coaches e empreendedores do LinkedIn:
use frases de efeito, história pessoal emocionante (pode ser inventada),
quebras de linha dramáticas, emojis estratégicos, moral da história no final
e um CTA (call to action) genérico.

Tom solicitado pelo usuário: ${tone}
Ideia ou frase de partida: ${phrase}

Regras obrigatórias:
- Use a frase de partida e o tom apenas como inspiração — não os copie literalmente no post
- Substitua qualquer termo inadequado ou palavrão por metáforas no estilo LinkedIn
- Nunca mencione, estereotipe ou ridicularize grupos por raça, gênero, religião ou orientação
- O post deve ter entre 150 e 300 palavras
- Retorne apenas o texto do post, sem explicações, títulos ou formatação externa`;
}

// ---------------------------------------------------------------------------
// Fetch with timeout via AbortController + Promise.race
// ---------------------------------------------------------------------------
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// AI providers
// ---------------------------------------------------------------------------

/**
 * Attempt generation via Groq (llama3-8b-8192).
 * @param {string} prompt
 * @returns {Promise<string>} Generated post text
 */
async function tryGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 512,
      }),
    },
    5000 // 5 s aggressive timeout
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Groq HTTP ${response.status}: ${text}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned empty content');
  return text;
}

/**
 * Attempt generation via Google Gemini (gemini-1.5-flash).
 * @param {string} prompt
 * @returns {Promise<string>} Generated post text
 */
async function tryGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 512,
        },
      }),
    },
    4000 // 4 s timeout
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Gemini HTTP ${response.status}: ${text}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned empty content');
  return text;
}

/**
 * Attempt generation via HuggingFace Inference API (google/flan-t5-base).
 * @param {string} prompt
 * @returns {Promise<string>} Generated post text
 */
async function tryHuggingFace(prompt) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not configured');

  const response = await fetchWithTimeout(
    'https://api-inference.huggingface.co/models/google/flan-t5-base',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 512, temperature: 0.9 },
      }),
    },
    8000 // 8 s — accounts for cold start on free tier
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HuggingFace HTTP ${response.status}: ${text}`);
  }

  const data = await response.json();

  // HuggingFace returns [{ generated_text: "..." }] or { generated_text: "..." }
  let text = '';
  if (Array.isArray(data) && data[0]?.generated_text) {
    text = data[0].generated_text.trim();
  } else if (data?.generated_text) {
    text = data.generated_text.trim();
  }

  if (!text) throw new Error('HuggingFace returned empty content');
  return text;
}

/**
 * Try each AI provider in cascade: Groq → Gemini → HuggingFace.
 * @param {string} prompt
 * @returns {Promise<string>} Generated post text
 */
async function generatePost(prompt) {
  // 1. Groq
  try {
    return await tryGroq(prompt);
  } catch (err) {
    console.error('[generate] Groq failed:', err.message);
  }

  // 2. Gemini
  try {
    return await tryGemini(prompt);
  } catch (err) {
    console.error('[generate] Gemini failed:', err.message);
  }

  // 3. HuggingFace
  try {
    return await tryHuggingFace(prompt);
  } catch (err) {
    console.error('[generate] HuggingFace failed:', err.message);
  }

  throw new Error('All AI providers failed');
}

// ---------------------------------------------------------------------------
// Supabase persistence — enforce 20-post limit then insert
// ---------------------------------------------------------------------------

/**
 * Save the generated post to Supabase.
 * If the user already has 20 posts, the oldest one is deleted first.
 * @param {object} supabase - Supabase admin client
 * @param {string} userId
 * @param {string} phrase
 * @param {string} tone
 * @param {string} post
 */
async function savePost(supabase, userId, phrase, tone, post) {
  // Count current posts
  const { count, error: countError } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.error('[generate] Supabase count error:', countError.message);
    throw new Error('Database count failed');
  }

  // If at limit, delete the oldest post
  if (count >= 20) {
    const { data: oldest, error: fetchError } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError) {
      console.error('[generate] Supabase fetch oldest error:', fetchError.message);
      throw new Error('Database fetch oldest failed');
    }

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', oldest.id);

    if (deleteError) {
      console.error('[generate] Supabase delete error:', deleteError.message);
      throw new Error('Database delete failed');
    }
  }

  // Insert new post
  const { error: insertError } = await supabase.from('posts').insert({
    user_id: userId,
    input_phrase: phrase,
    tone: tone,
    output_post: post,
  });

  if (insertError) {
    console.error('[generate] Supabase insert error:', insertError.message);
    throw new Error('Database insert failed');
  }
}

// ---------------------------------------------------------------------------
// CORS headers helper
// ---------------------------------------------------------------------------
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ---------------------------------------------------------------------------
// Main handler — exported as default (ESM, required by Vercel + package type: module)
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  // Set CORS headers on every response
  Object.entries(corsHeaders()).forEach(([key, value]) => res.setHeader(key, value));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res
      .status(405)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Method not allowed' });
  }

  // ── 1. Parse body ──────────────────────────────────────────────────────────
  const { phrase, tone } = req.body ?? {};

  if (!phrase || typeof phrase !== 'string' || phrase.trim() === '') {
    return res
      .status(400)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'O campo "phrase" é obrigatório.' });
  }

  // ── 2. Verify JWT — extract userId from Supabase Auth ─────────────────────
  const authHeader = req.headers['authorization'] ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Não autorizado.' });
  }

  let supabase;
  let userId;

  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error('[generate] Supabase init error:', err.message);
    return res
      .status(500)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Não foi possível gerar o post.' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res
        .status(401)
        .setHeader('Content-Type', 'application/json')
        .json({ error: 'Não autorizado.' });
    }
    userId = data.user.id;
  } catch (err) {
    console.error('[generate] JWT verification error:', err.message);
    return res
      .status(401)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Não autorizado.' });
  }

  // ── 3. Sanitize inputs ────────────────────────────────────────────────────
  const cleanPhrase = sanitize(phrase);
  const cleanTone = sanitize(typeof tone === 'string' ? tone : '');

  if (!cleanPhrase) {
    return res
      .status(400)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'O campo "phrase" contém apenas caracteres inválidos.' });
  }

  if (cleanPhrase.length > 5000) {
    return res
      .status(400)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'A frase é muito longa. Máximo de 5000 caracteres.' });
  }

  // ── 4. Rate limiting ──────────────────────────────────────────────────────
  if (!checkRateLimit(userId)) {
    return res
      .status(429)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Limite de gerações atingido. Tente novamente em 1 minuto.' });
  }

  // ── 5. Build prompt ───────────────────────────────────────────────────────
  const prompt = buildPrompt(cleanPhrase, cleanTone || 'neutro');

  // ── 6. Generate post (cascade: Groq → Gemini → HuggingFace) ──────────────
  let generatedPost;
  try {
    generatedPost = await generatePost(prompt);
  } catch (err) {
    console.error('[generate] All AI providers exhausted:', err.message);
    return res
      .status(502)
      .setHeader('Content-Type', 'application/json')
      .json({ error: 'Não foi possível gerar o post.' });
  }

  // ── 7. Save to Supabase ───────────────────────────────────────────────────
  try {
    await savePost(supabase, userId, cleanPhrase, cleanTone, generatedPost);
  } catch (err) {
    console.error('[generate] Save to Supabase failed:', err.message);
    // Still return the generated post even if saving failed — UX > persistence
    return res
      .status(200)
      .setHeader('Content-Type', 'application/json')
      .json({ post: generatedPost, saved: false });
  }

  // ── 8. Success ────────────────────────────────────────────────────────────
  return res
    .status(200)
    .setHeader('Content-Type', 'application/json')
    .json({ post: generatedPost, saved: true });
}

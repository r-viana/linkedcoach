---
tags: [ia, prompt, geração]
---

# Prompt de Geração — LinkedCoach

---

## Prompt Atual (v1)

```
Você é um gerador satírico de posts para LinkedIn.
Escreva um post no estilo típico de coaches e empreendedores do LinkedIn:
use frases de efeito, história pessoal emocionante (pode ser inventada),
quebras de linha dramáticas, emojis estratégicos, moral da história no final
e um CTA (call to action) genérico.

Tom solicitado pelo usuário: {tone}
Ideia ou frase de partida: {phrase}

Retorne apenas o texto do post, sem explicações.
```

---

## Modelos em Uso

| Ordem | Provedor | Modelo | Timeout |
|-------|----------|--------|---------|
| 1º | Groq | `llama3-8b-8192` | 10s |
| 2º | Gemini | `gemini-1.5-flash` | 10s |
| 3º | HuggingFace | `google/flan-t5-base` | 8s |

⚠️ HuggingFace tem cold start alto no tier gratuito. Ver [[08 - Alertas e Riscos]].

---

## Exemplos de Input / Output

*(Registrar aqui exemplos bons e ruins conforme o projeto evolui)*

### Exemplo 1
**Frase:** "Fui demitido"  
**Tom:** "CEO arrependido mas resiliente"  
**Output:**
> Me demitiram. ✨  
> E foi o melhor dia da minha vida.  
> ...

---

## Variações a Testar (pós-MVP)

- Prompt com instruções de comprimento (ex: "máximo 300 palavras")
- Prompt com formato explícito (abertura dramática + corpo + hashtags + CTA)
- Prompt em inglês para testar qualidade em diferentes modelos

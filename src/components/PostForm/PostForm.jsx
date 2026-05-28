import { useState } from 'react'
import styles from './PostForm.module.css'

const TONE_MAX = 140

export default function PostForm({ onSubmit, loading }) {
  const [phrase, setPhrase] = useState('')
  const [tone, setTone] = useState('')

  const toneRemaining = TONE_MAX - tone.length

  function handleSubmit(e) {
    e.preventDefault()
    if (!phrase.trim() || loading) return
    onSubmit({ phrase, tone })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="phrase" className={styles.label}>
          Sua ideia ou frase
        </label>
        <textarea
          id="phrase"
          className={styles.textarea}
          rows={4}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="Ex: Fui demitido e aprendi a importância do fracasso"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="tone" className={styles.label}>
          Tom do post
        </label>
        <textarea
          id="tone"
          className={styles.textarea}
          rows={2}
          value={tone}
          maxLength={TONE_MAX}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Ex: inspirador, épico, humilde mas vencedor"
        />
        <span
          className={`${styles.counter} ${toneRemaining < 20 ? styles.counterWarning : ''}`}
        >
          {toneRemaining} caracteres restantes
        </span>
      </div>

      <button
        type="submit"
        className={styles.button}
        disabled={loading || !phrase.trim()}
      >
        {loading ? (
          <span className={styles.loadingText}>
            Gerando<span className={styles.dots}>...</span>
          </span>
        ) : (
          'Gerar Post'
        )}
      </button>
    </form>
  )
}

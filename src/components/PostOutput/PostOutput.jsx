import { useState, useEffect } from 'react'
import styles from './PostOutput.module.css'

export default function PostOutput({ post }) {
  const [localPost, setLocalPost] = useState(post || '')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLocalPost(post || '')
  }, [post])

  async function handleCopy() {
    if (!localPost) return
    try {
      await navigator.clipboard.writeText(localPost)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      // fallback: seleciona o texto para o usuário copiar manualmente
      const textarea = document.querySelector('textarea[aria-label="Post gerado"]')
      if (textarea) textarea.select()
    }
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        className={styles.textarea}
        value={localPost}
        onChange={(e) => setLocalPost(e.target.value)}
        placeholder="Seu post aparecerá aqui..."
        aria-label="Post gerado"
      />
      <button
        type="button"
        className={styles.copyButton}
        onClick={handleCopy}
        disabled={!localPost}
      >
        {copied ? 'Copiado! ✓' : 'Copiar'}
      </button>
    </div>
  )
}

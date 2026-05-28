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
    await navigator.clipboard.writeText(localPost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

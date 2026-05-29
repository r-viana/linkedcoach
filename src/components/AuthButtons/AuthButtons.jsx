import { useState } from 'react'
import styles from './AuthButtons.module.css'

export default function AuthButtons({
  onSignInWithGoogle,
  onSignInWithEmail,
  onSignUpWithEmail,
  error,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [isLoading, setIsLoading] = useState(false)

  function handleModeSwitch(novoModo) {
    setMode(novoModo)
    setPassword('')
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (mode === 'login') {
        await onSignInWithEmail(email, password)
      } else {
        await onSignUpWithEmail(email, password)
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogle() {
    setIsLoading(true)
    try {
      await onSignInWithGoogle()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.socialButton}
        onClick={handleGoogle}
        disabled={isLoading}
      >
        Entrar com Google
      </button>

      <div className={styles.divider}>
        <span>ou</span>
      </div>

      <form className={styles.form} onSubmit={handleFormSubmit}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isLoading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Senha
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            disabled={isLoading}
          />
        </div>

        {mode === 'signup' && (
          <p className={styles.hint}>
            Após o cadastro, você receberá um e-mail de confirmação. Clique no link para ativar sua conta.
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.button} disabled={isLoading}>
            {mode === 'login'
              ? (isLoading ? 'Entrando...' : 'Entrar')
              : (isLoading ? 'Cadastrando...' : 'Cadastrar')}
          </button>
        </div>

        <button
          type="button"
          className={styles.modeToggle}
          disabled={isLoading}
          onClick={() => handleModeSwitch(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Não tem conta? Cadastrar-se' : 'Já tem conta? Entrar'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

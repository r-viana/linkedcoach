import { useState } from 'react'
import styles from './AuthButtons.module.css'

export default function AuthButtons({
  onSignInWithGoogle,
  onSignInWithGitHub,
  onSignInWithEmail,
  onSignUpWithEmail,
  error,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmitSignIn(e) {
    e.preventDefault()
    onSignInWithEmail(email, password)
  }

  function handleSignUp(e) {
    e.preventDefault()
    onSignUpWithEmail(email, password)
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.socialButton}
        onClick={() => { console.log('[AuthButtons] clique Google'); onSignInWithGoogle() }}
      >
        Entrar com Google
      </button>

      <button
        type="button"
        className={styles.socialButton}
        onClick={() => { console.log('[AuthButtons] clique GitHub'); onSignInWithGitHub() }}
      >
        Entrar com GitHub
      </button>

      <div className={styles.divider}>
        <span>ou</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmitSignIn}>
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
            autoComplete="current-password"
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.button}>
            Entrar
          </button>
          <button
            type="button"
            className={styles.buttonOutline}
            onClick={handleSignUp}
          >
            Cadastrar
          </button>
        </div>
      </form>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

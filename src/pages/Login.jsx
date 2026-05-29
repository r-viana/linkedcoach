import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import CloudBackground from '../components/CloudBackground/CloudBackground'
import AuthButtons from '../components/AuthButtons/AuthButtons'

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    borderRadius: '16px',
    padding: '2.5rem',
    width: 'min(420px, 90vw)',
    boxShadow: 'var(--glass-shadow)',
    border: '1px solid var(--glass-border)',
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '3rem',
    color: 'var(--color-accent)',
    marginBottom: '0.25rem',
    lineHeight: 1,
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  successIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '2px solid var(--color-accent)',
    color: 'var(--color-accent)',
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 auto 1.5rem',
  },
  successTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '2rem',
    color: 'var(--color-accent)',
    marginBottom: '0.75rem',
    lineHeight: 1,
    textAlign: 'center',
  },
  successMessage: {
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  successEmail: {
    color: 'var(--color-text)',
    fontWeight: '700',
  },
  backButton: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    color: 'var(--color-accent)',
    border: '1px solid var(--color-accent)',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },
}

export default function Login() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [error, setError] = useState(null)
  const [signUpSuccess, setSignUpSuccess] = useState(null)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSignInWithEmail(email, password) {
    const { error: err } = await signInWithEmail(email, password)
    if (err) setError(err.message)
    else setError(null)
  }

  async function handleSignUpWithEmail(email, password) {
    const { error: err } = await signUpWithEmail(email, password)
    if (err) {
      setError(err.message)
    } else {
      setError(null)
      setSignUpSuccess(email)
    }
  }

  if (signUpSuccess) {
    return (
      <>
        <CloudBackground />
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.successTitle}>Verifique seu e-mail</h1>
            <p style={styles.successMessage}>
              Enviamos um link de confirmação para{' '}
              <span style={styles.successEmail}>{signUpSuccess}</span>.
              Após confirmar, volte aqui para entrar.
            </p>
            <button
              type="button"
              style={styles.backButton}
              onClick={() => {
                setSignUpSuccess(null)
                setError(null)
              }}
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <CloudBackground />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>LinkedCoach</h1>
          <p style={styles.subtitle}>
            Transforme qualquer frase em um post de LinkedIn coach
          </p>
          <AuthButtons
            onSignInWithGoogle={async () => {
              setError(null)
              const { error } = await signInWithGoogle()
              if (error) setError('Não foi possível conectar com o Google. Tente novamente.')
            }}
            onSignInWithEmail={handleSignInWithEmail}
            onSignUpWithEmail={handleSignUpWithEmail}
            error={error}
          />
        </div>
      </div>
    </>
  )
}

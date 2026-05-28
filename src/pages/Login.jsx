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
}

export default function Login() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [error, setError] = useState(null)

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
    if (err) setError(err.message)
    else setError(null)
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

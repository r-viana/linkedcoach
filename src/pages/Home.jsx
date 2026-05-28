import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useHistory from '../hooks/useHistory'
import supabase from '../lib/supabaseClient'
import CloudBackground from '../components/CloudBackground/CloudBackground'
import PostForm from '../components/PostForm/PostForm'
import PostOutput from '../components/PostOutput/PostOutput'
import History from '../components/History/History'
import styles from './Home.module.css'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const { history, selectedPost, fetchHistory, addToHistory, selectPost } = useHistory()

  const [generatedPost, setGeneratedPost] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchHistory(user.id)
    }
  }, [user])

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  async function handleGenerate({ phrase, tone }) {
    setGenerating(true)
    setGenerateError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phrase, tone }),
      })

      const data = await response.json()

      if (data.error) {
        setGenerateError(data.error)
      } else if (data.post) {
        setGeneratedPost(data.post)
        addToHistory({
          id: Date.now(),
          input_phrase: phrase,
          output_post: data.post,
          tone,
          created_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      setGenerateError('Erro ao gerar o post. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  const displayPost = selectedPost?.output_post ?? generatedPost

  return (
    <div className={styles.layout}>
      <CloudBackground />

      <header className={styles.header}>
        <span className={styles.headerLogo}>LinkedCoach</span>
        <div className={styles.headerUser}>
          <span className={styles.headerEmail}>{user.email}</span>
          <button
            type="button"
            className={styles.signOutButton}
            onClick={signOut}
          >
            Sair
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.leftColumn}>
          <PostForm onSubmit={handleGenerate} loading={generating} />
          {generateError && (
            <p className={styles.errorMessage}>{generateError}</p>
          )}
          <History
            history={history}
            onSelect={selectPost}
            selectedPostId={selectedPost?.id}
          />
        </div>

        <div className={styles.rightColumn}>
          <PostOutput post={displayPost} />
        </div>
      </main>
    </div>
  )
}

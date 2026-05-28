import { useState, useEffect } from 'react'
import supabase from '../lib/supabaseClient'

/**
 * Hook de autenticação. Gerencia sessão via onAuthStateChange do Supabase.
 * O token nunca é armazenado em variável local — sempre recuperado via getSession().
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carrega a sessão atual ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuta mudanças de autenticação (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] onAuthStateChange:', event, { autenticado: !!session })
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const user = session?.user ?? null

  async function signInWithEmail(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUpWithEmail(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  async function signInWithGoogle() {
    console.log('[useAuth] signInWithGoogle iniciado, redirectTo:', window.location.origin)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    console.log('[useAuth] signInWithOAuth Google resultado:', { url: data?.url, error: error?.message })
    if (error) return { error }
    if (data?.url) {
      console.log('[useAuth] redirect manual Google para:', data.url)
      window.location.href = data.url
    }
    return { error: null }
  }

  async function signInWithGitHub() {
    console.log('[useAuth] signInWithGitHub iniciado, redirectTo:', window.location.origin)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
    console.log('[useAuth] signInWithOAuth GitHub resultado:', { url: data?.url, error: error?.message })
    if (error) return { error }
    if (data?.url) {
      console.log('[useAuth] redirect manual GitHub para:', data.url)
      window.location.href = data.url
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    session,
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  }
}

export default useAuth

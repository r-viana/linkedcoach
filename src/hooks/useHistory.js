import { useState } from 'react'
import supabase from '../lib/supabaseClient'

/**
 * Hook de histórico de posts.
 * A inserção no banco é responsabilidade do backend (/api/generate).
 * Este hook apenas lê o banco e mantém o estado local sincronizado.
 */
export function useHistory() {
  const [history, setHistory] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [errorHistory, setErrorHistory] = useState(null)

  /**
   * Busca os últimos 20 posts do usuário no Supabase.
   * O RLS garante que o usuário só recebe os próprios registros.
   * @param {string} userId
   */
  async function fetchHistory(userId) {
    setLoadingHistory(true)
    setErrorHistory(null)

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      setErrorHistory(error.message)
    } else {
      setHistory(data ?? [])
    }

    setLoadingHistory(false)
  }

  /**
   * Adiciona um post ao início do histórico local.
   * Não faz inserção no banco — o backend já realizou o INSERT.
   * Mantém o limite de 20 itens no estado local.
   * @param {Object} post
   */
  function addToHistory(post) {
    setHistory(prev => [post, ...prev].slice(0, 20))
  }

  /**
   * Seleciona um post para exibição no output.
   * @param {Object} post
   */
  function selectPost(post) {
    setSelectedPost(post)
  }

  /** Limpa o post selecionado. */
  function clearSelection() {
    setSelectedPost(null)
  }

  return {
    history,
    selectedPost,
    loadingHistory,
    errorHistory,
    fetchHistory,
    addToHistory,
    selectPost,
    clearSelection,
  }
}

export default useHistory

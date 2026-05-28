import styles from './History.module.css'

const TRUNCATE_LENGTH = 60

function truncate(text) {
  if (!text) return ''
  return text.length > TRUNCATE_LENGTH
    ? text.slice(0, TRUNCATE_LENGTH) + '...'
    : text
}

export default function History({ history, onSelect, selectedPostId }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Histórico</h2>

      {history && history.length > 0 ? (
        <ul
          className={styles.list}
          aria-label="Histórico de posts gerados"
        >
          {history.map((post) => (
            <li
              key={post.id}
              className={`${styles.item} ${post.id === selectedPostId ? styles.itemSelected : ''}`}
              onClick={() => onSelect(post)}
            >
              {truncate(post.input_phrase)}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>Nenhum post ainda.</p>
      )}
    </section>
  )
}

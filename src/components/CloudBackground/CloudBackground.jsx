import styles from './CloudBackground.module.css'
import '../../styles/clouds.css'

export default function CloudBackground() {
  return (
    <div className={styles.container}>
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <div className="cloud cloud-5" />
      <div className="cloud cloud-6" />
    </div>
  )
}

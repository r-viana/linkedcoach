import styles from './CloudBackground.module.css'
import '../../styles/clouds.css'

const CLOUDS = [
  { w: 200, h: 60,  top: '10%', opacity: 0.18, duration: '80s',  delay: '-15s', bW: 90,  bH: 90,  bLeft: 30,  aW: 60,  aH: 60,  aLeft: 100 },
  { w: 300, h: 80,  top: '25%', opacity: 0.14, duration: '100s', delay: '-40s', bW: 120, bH: 120, bLeft: 50,  aW: 80,  aH: 80,  aLeft: 160 },
  { w: 160, h: 50,  top: '40%', opacity: 0.16, duration: '120s', delay: '-60s', bW: 70,  bH: 70,  bLeft: 20,  aW: 50,  aH: 50,  aLeft: 80  },
  { w: 250, h: 70,  top: '55%', opacity: 0.20, duration: '135s', delay: '-25s', bW: 100, bH: 100, bLeft: 40,  aW: 75,  aH: 75,  aLeft: 140 },
  { w: 120, h: 40,  top: '5%',  opacity: 0.15, duration: '150s', delay: '-80s', bW: 55,  bH: 55,  bLeft: 15,  aW: 40,  aH: 40,  aLeft: 65  },
  { w: 220, h: 65,  top: '70%', opacity: 0.22, duration: '160s', delay: '-50s', bW: 95,  bH: 95,  bLeft: 35,  aW: 65,  aH: 65,  aLeft: 120 },
  { w: 180, h: 55,  top: '18%', opacity: 0.17, duration: '90s',  delay: '-35s', bW: 80,  bH: 80,  bLeft: 25,  aW: 55,  aH: 55,  aLeft: 90  },
  { w: 280, h: 75,  top: '60%', opacity: 0.13, duration: '110s', delay: '-70s', bW: 110, bH: 110, bLeft: 55,  aW: 70,  aH: 70,  aLeft: 150 },
  { w: 140, h: 45,  top: '33%', opacity: 0.19, duration: '125s', delay: '-10s', bW: 60,  bH: 60,  bLeft: 18,  aW: 45,  aH: 45,  aLeft: 75  },
  { w: 240, h: 70,  top: '78%', opacity: 0.16, duration: '145s', delay: '-55s', bW: 105, bH: 105, bLeft: 45,  aW: 72,  aH: 72,  aLeft: 135 },
  { w: 100, h: 35,  top: '48%', opacity: 0.14, duration: '170s', delay: '-90s', bW: 45,  bH: 45,  bLeft: 12,  aW: 32,  aH: 32,  aLeft: 55  },
  { w: 320, h: 85,  top: '85%', opacity: 0.21, duration: '95s',  delay: '-20s', bW: 130, bH: 130, bLeft: 60,  aW: 85,  aH: 85,  aLeft: 175 },
]

export default function CloudBackground() {
  return (
    <div className={styles.container}>
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            '--cloud-w':        `${c.w}px`,
            '--cloud-h':        `${c.h}px`,
            '--cloud-top':      c.top,
            '--cloud-opacity':  c.opacity,
            '--cloud-duration': c.duration,
            '--cloud-delay':    c.delay,
            '--cloud-b-w':      `${c.bW}px`,
            '--cloud-b-h':      `${c.bH}px`,
            '--cloud-b-top':    `${-(c.bH / 2)}px`,
            '--cloud-b-left':   `${c.bLeft}px`,
            '--cloud-a-w':      `${c.aW}px`,
            '--cloud-a-h':      `${c.aH}px`,
            '--cloud-a-top':    `${-(c.aH / 2)}px`,
            '--cloud-a-left':   `${c.aLeft}px`,
          }}
        />
      ))}
    </div>
  )
}

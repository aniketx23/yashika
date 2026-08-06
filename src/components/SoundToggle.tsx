import { AnimatePresence, motion } from 'motion/react';
import { useAmbientSound } from '../hooks/useAmbientSound';
import { EASE_SETTLE } from '../lib/motion';
import styles from './SoundToggle.module.css';

export default function SoundToggle() {
  const { on, toggle, volume, setVolume } = useAmbientSound();
  const percent = Math.round(volume * 100);

  return (
    <div className={styles.dock}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle music"
        aria-pressed={on}
        className={styles.toggle}
      >
        {on ? '✧ SOUND ON' : '✧ SOUND OFF'}
      </button>

      {/* Mounted only while playing, so nothing focusable hides behind aria-hidden. */}
      <AnimatePresence>
        {on && (
          <motion.div
            className={styles.fader}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45, ease: EASE_SETTLE }}
          >
            <span
              aria-hidden="true"
              className={styles.track}
              style={{
                background: `linear-gradient(90deg, var(--gold) ${percent}%, rgba(237,234,255,.18) ${percent}%)`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={percent}
              onChange={(e) => setVolume(e.currentTarget.valueAsNumber / 100)}
              aria-label="Music volume"
              className={styles.range}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { INVITE } from '../config';
import { useAmbientSound } from '../hooks/useAmbientSound';
import styles from './SoundToggle.module.css';

export default function SoundToggle() {
  const { on, toggle } = useAmbientSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle music"
      aria-pressed={on}
      title={INVITE.soundtrack}
      className={styles.toggle}
    >
      {on ? '✧ SOUND ON' : '✧ SOUND OFF'}
    </button>
  );
}

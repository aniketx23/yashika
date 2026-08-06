import { motion } from 'motion/react';
import { INVITE } from '../config';
import { useCountdown } from '../hooks/useCountdown';
import { EASE_SETTLE } from '../lib/motion';
import styles from './StickyBar.module.css';

interface Props {
  visible: boolean;
  onRsvp(): void;
}

export default function StickyBar({ visible, onRsvp }: Props) {
  const { days, hours, minutes, seconds, done } = useCountdown(INVITE.target);
  const label = done ? "IT'S TONIGHT ✦" : `${days}D ${hours}H ${minutes}M ${seconds}S`;

  return (
    <motion.div
      className={styles.wrap}
      initial={{ y: '130%' }}
      animate={{ y: visible ? '0%' : '130%' }}
      transition={{ duration: 0.6, ease: EASE_SETTLE }}
    >
      <div className={styles.pill}>
        <span className={styles.clock}>{label}</span>
        <button type="button" onClick={onRsvp} className={styles.cta}>
          RSVP
        </button>
      </div>
    </motion.div>
  );
}

import { Fragment } from 'react';
import { motion } from 'motion/react';
import { EASE_SETTLE } from '../lib/motion';
import styles from './text.module.css';

interface Props {
  text: string;
  revealed: boolean;
  className?: string | undefined;
  /** Seconds before the first word moves. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
  duration?: number;
}

/**
 * Word-by-word mask reveal: each word rides up from behind its own clipping
 * edge. No opacity — the mask does the work, which is what separates a
 * ceremonial reveal from a fade.
 *
 * Words wrap naturally, so this survives any line count. The full string stays
 * on the wrapper for assistive tech; the shards are hidden from it.
 */
export default function SplitReveal({
  text,
  revealed,
  className,
  delay = 0,
  stagger = 0.055,
  duration = 0.9,
}: Props) {
  const words = text.split(' ');

  return (
    <span className={className}>
      <span className={styles.srOnly}>{text}</span>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className={styles.mask} aria-hidden="true">
            <motion.span
              className={styles.shard}
              initial={{ y: '115%' }}
              animate={{ y: revealed ? '0%' : '115%' }}
              transition={{ duration, ease: EASE_SETTLE, delay: delay + i * stagger }}
            >
              {word}
            </motion.span>
          </span>
          {/* Outside the mask: a space inside an overflow:hidden inline-block collapses. */}
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}

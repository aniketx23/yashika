import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import styles from './text.module.css';

/** Only letters scramble. Spaces, dots and the star stay put, so the line
 *  keeps its shape and reads as an instrument locking on rather than noise. */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SCRAMBLE = /[A-Z]/;
/** Seconds each character stays unresolved after the one before it. */
const PER_CHAR = 0.042;
const CYCLE_MS = 45;

interface Props {
  text: string;
  active: boolean;
  className?: string | undefined;
}

export default function Decode({ text, active, className }: Props) {
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(() => (reduced ? text : ''));
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !active) return;
    if (reduced) {
      setFrame(text);
      done.current = true;
      return;
    }

    done.current = true;
    const chars = [...text];
    const start = performance.now();
    const span = chars.length * PER_CHAR * 1000;
    let raf = 0;
    let lastCycle = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (now - lastCycle >= CYCLE_MS) {
        lastCycle = now;
        const settled = Math.floor(elapsed / (PER_CHAR * 1000));
        setFrame(
          chars
            .map((c, i) => {
              if (i < settled || !SCRAMBLE.test(c)) return c;
              return GLYPHS[(Math.random() * GLYPHS.length) | 0]!;
            })
            .join(''),
        );
      }
      if (elapsed < span) raf = requestAnimationFrame(tick);
      else setFrame(text);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, text]);

  return (
    <span className={className}>
      <span className={styles.srOnly}>{text}</span>
      <span className={styles.decode} aria-hidden="true">
        {frame || '\u00a0'}
      </span>
    </span>
  );
}

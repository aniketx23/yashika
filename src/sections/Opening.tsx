import { useRef, type RefObject } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { rise, settle } from '../lib/motion';
import styles from './Opening.module.css';

interface Props {
  /** The hero enters the moment the gate unmounts. */
  visible: boolean;
  parallaxRef: RefObject<HTMLDivElement | null>;
}

export default function Opening({ visible, parallaxRef }: Props) {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const state = visible ? 'shown' : 'hidden';
  const common = { variants: rise, initial: 'hidden' as const, animate: state };

  /* Leaving the hero, the whole plate recedes into the portal rather than
     merely scrolling off. Drifts slower than the page, so it lingers. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const recedeY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -110]);
  const recedeO = useTransform(scrollYProgress, [0, 0.75], reduced ? [1, 1] : [1, 0]);

  return (
    <section ref={sectionRef} className={styles.opening}>
      {/* MAHAYA = Mahajan + Yashika. Easter egg — keep it. */}
      <div ref={parallaxRef} aria-hidden="true" className={`${styles.mahaya} anim-float`}>
        MAHAYA
      </div>

      <motion.div className={styles.plate} style={{ y: recedeY, opacity: recedeO }}>
        <motion.div {...common} transition={settle(0.8, 0.5)} className={styles.layer}>
          <p className={`${styles.eyebrow} anim-breathe-5`}>
            ✦ THE LION&apos;S GATE PORTAL · PEAK 08/08 ✦
          </p>
        </motion.div>

        <motion.h1 {...common} transition={settle(1.1, 0.7)} className={styles.name}>
          Yashika
          <br />
          Mahajan
        </motion.h1>

        <motion.div {...common} transition={settle(0.9, 1.05)} className={styles.dividerRow}>
          <span aria-hidden="true" className={`${styles.rule} ${styles.ruleLeft} anim-breathe-4`} />
          <span className={styles.turning}>IS TURNING</span>
          <span
            aria-hidden="true"
            className={`${styles.rule} ${styles.ruleRight} anim-breathe-4-late`}
          />
        </motion.div>

        <motion.div {...common} transition={settle(1.1, 1.2)} className={`${styles.age} anim-glow`}>
          23
        </motion.div>

        <motion.p {...common} transition={settle(0.9, 1.4)} className={styles.when}>
          SATURDAY · 08 AUGUST 2026 · FROM 6:00 PM
        </motion.p>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className={styles.scrollCue}
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 1, ease: 'easeInOut', delay: 1.85 }}
      >
        <span className={`${styles.chevron} anim-chev`}>↓</span>
      </motion.div>
    </section>
  );
}

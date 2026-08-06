import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import SplitReveal from '../components/SplitReveal';
import { INVITE } from '../config';
import { EASE_PORTAL, rise, settle } from '../lib/motion';
import { waLink } from '../lib/whatsapp';
import styles from './Seal.module.css';

/** How long the seam stands open before the portal shuts. */
const CLOSE_AFTER = 2400;

interface Props {
  sectionRef(el: HTMLElement | null): void;
  revealed: boolean;
}

export default function Seal({ sectionRef, revealed }: Props) {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const id = window.setTimeout(() => setClosed(true), CLOSE_AFTER);
    return () => window.clearTimeout(id);
  }, [revealed]);

  return (
    <section ref={sectionRef} className={styles.seal}>
      <motion.div
        variants={rise}
        initial="hidden"
        animate={revealed ? 'shown' : 'hidden'}
        transition={settle(1)}
      >
        <p aria-hidden="true" className={`${styles.mahaya} anim-breathe-7`}>
          M A H A Y A
        </p>

        <motion.div
          aria-hidden="true"
          className={styles.seam}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: revealed ? (closed ? 0.04 : 1) : 0 }}
          transition={{ duration: 2.4, ease: EASE_PORTAL }}
        />

        <p className={styles.date}>08 · 08 · 26</p>
        <p className={styles.farewell}>
          <SplitReveal text="See you on the other side." revealed={revealed} delay={0.25} />
        </p>
        <p className={styles.contact}>
          questions, coordinates, conspiracies —
          <br />
          <a href={waLink(INVITE.whatsappNumber)} target="_blank" rel="noopener">
            WhatsApp {INVITE.whatsappDisplay}
          </a>
        </p>
      </motion.div>
    </section>
  );
}

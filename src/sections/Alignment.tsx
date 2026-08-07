import { motion } from 'motion/react';
import ConstellationMap from '../components/ConstellationMap';
import Decode from '../components/Decode';
import ScrollLitText, { type Segment } from '../components/ScrollLitText';
import { INVITE } from '../config';
import { MAPS } from '../lib/constellations';
import { rise, settle, stagger } from '../lib/motion';
import shared from './section.module.css';
import styles from './Alignment.module.css';

const COPY: readonly Segment[] = [
  { text: 'On 8/8 the Sun stands in Leo while' },
  { text: 'Sirius', strong: true },
  { text: '— the brightest star in the sky — returns to the dawn horizon after seventy nights away. Astrologers call it the year\u2019s most potent portal. We call it' },
  { text: 'Yashika season.', strong: true },
];

interface Row {
  label: string;
  value: string;
  /** Second line, set smaller and dimmer than the value. */
  meta?: string;
}

const ROWS: readonly Row[] = [
  { label: 'DATE', value: 'Saturday, 08 August 2026' },
  { label: 'TIME', value: '8:08 PM onwards' },
  { label: 'PLACE', value: INVITE.venueName, meta: INVITE.venueAddress },
  { label: 'SKY', value: 'Sun in Leo · Sirius rising' },
];

interface Props {
  sectionRef(el: HTMLElement | null): void;
  revealed: boolean;
}

export default function Alignment({ sectionRef, revealed }: Props) {
  const state = revealed ? 'shown' : 'hidden';

  return (
    <section ref={sectionRef} className={`${shared.section} ${styles.alignment}`}>
      <ConstellationMap config={MAPS.leo} revealed={revealed} />

      <div className={shared.inner}>
        <motion.div
          variants={rise}
          initial="hidden"
          animate={state}
          transition={settle(0.9)}
          className={styles.intro}
        >
          <Decode text="✦ THE ALIGNMENT" active={revealed} className={`${shared.kicker} anim-breathe-5`} />
          <ScrollLitText segments={COPY} className={styles.copy} />
        </motion.div>

        <motion.dl className={styles.rows} variants={stagger(0.12)} initial="hidden" animate={state}>
          {ROWS.map(({ label, value, meta }) => (
            <motion.div key={label} className={styles.row} variants={rise} transition={settle(0.8)}>
              <dt className={styles.label}>{label}</dt>
              <dd className={styles.value}>
                {value}
                {meta && <span className={styles.meta}>{meta}</span>}
                {label === 'PLACE' && INVITE.venueMapUrl && (
                  <a
                    href={INVITE.venueMapUrl}
                    target="_blank"
                    rel="noopener"
                    className={styles.mapLink}
                  >
                    OPEN IN MAPS ↗
                  </a>
                )}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

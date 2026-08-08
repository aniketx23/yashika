import { motion } from 'motion/react';
import Decode from '../components/Decode';
import SplitReveal from '../components/SplitReveal';
import { rise, settle, stagger } from '../lib/motion';
import shared from './section.module.css';
import styles from './Protocol.module.css';

interface Note {
  label: string;
  line: string;
}

/** The five things a guest has to actually remember. */
const NOTES: readonly Note[] = [
  {
    label: 'DOORS · 6:00 PM',
    line: 'Roll in from six. The portal seals at 8:08 sharp — turn up after that and you are on the wrong side of it.',
  },
  {
    label: 'SPARE CLOTHES',
    line: 'Pack a second outfit. The pool has plans for the first one.',
  },
  {
    label: 'DRESS CODE',
    line: 'Black, and every shade of grey you own.',
  },
  {
    label: 'BOARD GAMES',
    line: 'Raid your shelf. Bring the box that starts arguments.',
  },
  {
    label: 'SHADES',
    line: 'Sunglasses. After dark. No, we are not explaining.',
  },
];

interface Props {
  sectionRef(el: HTMLElement | null): void;
  revealed: boolean;
}

export default function Protocol({ sectionRef, revealed }: Props) {
  const state = revealed ? 'shown' : 'hidden';

  return (
    <section ref={sectionRef} className={`${shared.section} ${styles.protocol}`}>
      <div className={shared.inner}>
        <motion.div
          className={shared.centered}
          variants={rise}
          initial="hidden"
          animate={state}
          transition={settle(0.9)}
        >
          <Decode
            text="✦ THE FINE PRINT"
            active={revealed}
            className={`${shared.kicker} anim-breathe-5`}
          />
          <h2 className={`${shared.h2} ${styles.h2}`}>
            <SplitReveal text="Come prepared" revealed={revealed} />
          </h2>
          <p className={`${shared.sub} ${styles.sub}`}>five things — do not wing it</p>
        </motion.div>

        {/* Dashed rather than solid: this is the notice pinned to the gate,
            not another lit panel competing with the countdown. */}
        <motion.ol
          className={styles.board}
          variants={stagger(0.1)}
          initial="hidden"
          animate={state}
        >
          {NOTES.map((note, i) => (
            <motion.li
              key={note.label}
              className={styles.note}
              variants={rise}
              transition={settle(0.7)}
            >
              <span aria-hidden="true" className={styles.index}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.body}>
                <span className={styles.label}>{note.label}</span>
                <span className={styles.line}>{note.line}</span>
              </span>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

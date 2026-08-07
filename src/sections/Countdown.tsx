import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ConstellationMap from '../components/ConstellationMap';
import Decode from '../components/Decode';
import SplitReveal from '../components/SplitReveal';
import ScratchOverlay from './ScratchOverlay';
import { INVITE } from '../config';
import { useCountdown } from '../hooks/useCountdown';
import { MAPS } from '../lib/constellations';
import { EASE_SETTLE, rise, settle } from '../lib/motion';
import { useSky } from '../sky/SkyProvider';
import shared from './section.module.css';
import styles from './Countdown.module.css';

interface Props {
  sectionRef(el: HTMLElement | null): void;
  revealed: boolean;
}

function Cell({ value, label, gold }: { value: string; label: string; gold?: boolean }) {
  return (
    <div className={styles.cell} data-gold={gold ? '' : undefined}>
      <div className={styles.digits}>
        <motion.span
          key={value}
          className={styles.digit}
          initial={{ y: '0.45em', opacity: 0.2 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.38, ease: EASE_SETTLE }}
        >
          {value}
        </motion.span>
      </div>
      <div className={styles.cellLabel}>{label}</div>
    </div>
  );
}

export default function Countdown({ sectionRef, revealed }: Props) {
  const { days, hours, minutes, seconds } = useCountdown(INVITE.target);
  const sky = useSky();
  const panelRef = useRef<HTMLDivElement>(null);
  const [cleared, setCleared] = useState(false);
  const [hot, setHot] = useState(false);

  const reveal = useCallback(() => {
    setCleared((already) => {
      if (already) return already;
      const rect = panelRef.current?.getBoundingClientRect();
      sky.bloom(
        rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5,
        rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5,
        1900,
      );
      return true;
    });
  }, [sky]);

  const state = revealed ? 'shown' : 'hidden';

  return (
    <section ref={sectionRef} className={`${shared.section} ${styles.countdown}`}>
      <ConstellationMap config={MAPS.cma} revealed={revealed} />

      <div className={`${shared.inner} ${shared.centered}`}>
        <motion.div variants={rise} initial="hidden" animate={state} transition={settle(0.9)}>
          <Decode text="✦ THE COUNTDOWN" active={revealed} className={`${shared.kicker} anim-breathe-5`} />
          <h2 className={shared.h2}>
            <SplitReveal text="The portal peaks in…" revealed={revealed} />
          </h2>
          <p className={`${shared.sub} ${styles.sub}`}>it&apos;s buried in stardust — scratch it away</p>
        </motion.div>

        <motion.div
          ref={panelRef}
          className={styles.panel}
          data-hot={hot ? '' : undefined}
          variants={rise}
          initial="hidden"
          animate={state}
          transition={settle(0.9, 0.18)}
        >
          <div className={styles.grid}>
            <Cell value={days} label="DAYS" />
            <Cell value={hours} label="HRS" />
            <Cell value={minutes} label="MIN" />
            <Cell value={seconds} label="SEC" gold />
          </div>

          <div className={styles.coords}>
            <p className={styles.stamp}>08.08.26 — 8:08 PM IST</p>
            <p className={styles.venue}>
              {INVITE.venueName}
              <span className={styles.venueAddress}>{INVITE.venueAddress}</span>
            </p>
            {INVITE.venueMapUrl && (
              <a
                href={INVITE.venueMapUrl}
                target="_blank"
                rel="noopener"
                className={styles.mapLink}
              >
                OPEN IN MAPS ↗
              </a>
            )}
          </div>

          <AnimatePresence onExitComplete={() => setHot(true)}>
            {!cleared && (
              <ScratchOverlay key="scratch" panelRef={panelRef} onCleared={reveal} cleared={cleared} />
            )}
          </AnimatePresence>
        </motion.div>

        {!cleared && (
          <button type="button" onClick={reveal} className={styles.tapReveal}>
            CAN&apos;T SCRATCH? TAP TO REVEAL ✦
          </button>
        )}

        <p className={styles.footer}>THE PORTAL PEAKS 08/08 — SUN IN LEO · SIRIUS RISING</p>
      </div>
    </section>
  );
}

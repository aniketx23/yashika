import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import Gate from './components/Gate';
import ScrollRail from './components/ScrollRail';
import SoundToggle from './components/SoundToggle';
import StickyBar from './components/StickyBar';
import Alignment from './sections/Alignment';
import Awaits from './sections/Awaits';
import Countdown from './sections/Countdown';
import Opening from './sections/Opening';
import Protocol from './sections/Protocol';
import Seal from './sections/Seal';
import Summons from './sections/Summons';
import { INVITE } from './config';
import { useScrollDirector } from './hooks/useScrollDirector';
import { useSmoothScroll } from './lib/smoothScroll';
import { useSky } from './sky/SkyProvider';
import styles from './App.module.css';

type Phase = 'locked' | 'opening' | 'open';

export default function App() {
  const reduced = useReducedMotion();
  const sky = useSky();
  const lenis = useSmoothScroll();
  const [phase, setPhase] = useState<Phase>('locked');
  const [submitted, setSubmitted] = useState(false);

  const gateUp = phase !== 'open';
  const director = useScrollDirector({ enabled: !gateUp, onScrollY: sky.setScrollY, lenis });
  const { resetScroll, scrollToStage } = director;

  /*
   * Lock on <html>, not <body>: the viewport takes its overflow from the root
   * (global.css sets overflow-x there), so a lock on body would do nothing.
   * overflow-y only, so the root's overflow-x: hidden survives.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflowY = gateUp ? 'hidden' : '';
    /* Lenis must be halted too, or it keeps accumulating target scroll behind
       the gate and lurches the moment the doors open. */
    if (gateUp) lenis?.stop();
    else lenis?.start();
    return () => {
      root.style.overflowY = '';
    };
  }, [gateUp, lenis]);

  /** Scroll speed smears the star field along the direction of travel. */
  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => sky.setVelocity(lenis.velocity);
    lenis.on('scroll', onScroll);
    return () => lenis.off('scroll', onScroll);
  }, [lenis, sky]);

  /** Bloom, doors out, then unmount the gate and hand back the scroll. */
  useEffect(() => {
    if (phase !== 'opening') return;
    sky.bloom(0.5, 0.5, 2200);
    const second = window.setTimeout(() => sky.bloom(0.5, 0.42, 1500), 700);
    const finish = window.setTimeout(() => setPhase('open'), reduced ? 200 : 1750);
    return () => {
      window.clearTimeout(second);
      window.clearTimeout(finish);
    };
  }, [phase, reduced, sky]);

  useEffect(() => {
    if (phase === 'open') resetScroll();
  }, [phase, resetScroll]);

  const unlock = useCallback(() => {
    setPhase((current) => (current === 'locked' ? 'opening' : current));
  }, []);

  const goToRsvp = useCallback(() => scrollToStage('rsvp'), [scrollToStage]);

  return (
    <>
      <ScrollRail fillRef={director.railRef} />
      <SoundToggle />

      {gateUp && <Gate locked={phase === 'locked'} onComplete={unlock} />}

      <div className={styles.flow}>
        <Opening visible={!gateUp} parallaxRef={director.parallaxRef} />
        <Alignment sectionRef={director.register.align} revealed={director.revealed.align} />
        <Countdown sectionRef={director.register.count} revealed={director.revealed.count} />
        {INVITE.showAwaits && (
          <Awaits sectionRef={director.register.awaits} revealed={director.revealed.awaits} />
        )}
        <Protocol
          sectionRef={director.register.protocol}
          revealed={director.revealed.protocol}
        />
        <Summons
          sectionRef={director.register.rsvp}
          revealed={director.revealed.rsvp}
          submitted={submitted}
          onSubmitted={() => setSubmitted(true)}
          onEdit={() => setSubmitted(false)}
        />
        <Seal sectionRef={director.register.seal} revealed={director.revealed.seal} />
      </div>

      <StickyBar
        visible={director.past && !gateUp && !director.rsvpVisible && !submitted}
        onRsvp={goToRsvp}
      />
    </>
  );
}

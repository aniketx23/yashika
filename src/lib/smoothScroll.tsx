import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import type Lenis from 'lenis';
import type { LenisOptions } from 'lenis';
import 'lenis/dist/lenis.css';
import { prefersReducedMotion } from './motion';

/**
 * Lenis drives the *real* scroll position (`window.scrollTo` every frame), not
 * a transform — so the rect-check director and motion's `useScroll` keep
 * working untouched. No scroller proxy anywhere.
 */
const OPTIONS: LenisOptions = {
  /* Slightly longer glide than the 0.1 default: unhurried, but still tied to
     the hand. Any lower and the page feels detached from the input. */
  lerp: 0.085,
  smoothWheel: true,
  /* Touch stays native. iOS momentum beats anything we would synthesise, and
     ~95% of guests open this from a WhatsApp link on a phone. */
  syncTouch: false,
};

const SmoothScrollContext = createContext<Lenis | null>(null);

/** `null` when smoothing is off (reduced motion) — callers must handle it. */
export const useSmoothScroll = (): Lenis | null => useContext(SmoothScrollContext);

export function SmoothScroll({ children }: { children: ReactNode }) {
  /* Read once: this is a structural decision, and re-deciding would remount
     the whole tree. `respectReducedMotion` only forces lerp to 1 — it keeps
     the rAF loop alive — so the honest opt-out is not mounting Lenis at all. */
  const [enabled] = useState(() => !prefersReducedMotion());
  const lenisRef = useRef<LenisRef>(null);
  const [instance, setInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setInstance(lenisRef.current?.lenis ?? null);
  }, [enabled]);

  if (!enabled) {
    return <SmoothScrollContext.Provider value={null}>{children}</SmoothScrollContext.Provider>;
  }

  return (
    <ReactLenis root options={OPTIONS} ref={lenisRef}>
      <SmoothScrollContext.Provider value={instance}>{children}</SmoothScrollContext.Provider>
    </ReactLenis>
  );
}

import type Lenis from 'lenis';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/motion';

export const STAGES = ['align', 'count', 'awaits', 'protocol', 'rsvp', 'seal'] as const;
export type Stage = (typeof STAGES)[number];
export type Revealed = Record<Stage, boolean>;
export type RegisterStage = Record<Stage, (el: HTMLElement | null) => void>;
const NONE: Revealed = {
  align: false,
  count: false,
  awaits: false,
  protocol: false,
  rsvp: false,
  seal: false,
};

/** A section is revealed once its top crosses 88% of the viewport. One-way. */
const REVEAL_AT = 0.88;
/** The sticky bar arrives once the Alignment section is 60% up the viewport. */
const PAST_AT = 0.6;
/** Safety tick — guarantees reveals resolve even if no scroll event lands. */
const SWEEP_MS = 500;

type Sections = Partial<Record<Stage, HTMLElement | null>>;

/**
 * `IntersectionObserver` is deliberately avoided: in an embedded/scroll-container
 * context it silently never fires. A rAF-throttled rect check on a capture-phase
 * document listener is the reliable path.
 */
function resolveScroller(
  target: EventTarget | null,
  cache: RefObject<Element | null>,
  sections: RefObject<Sections>,
): Element {
  if (
    target instanceof Element &&
    target !== document.documentElement &&
    target.scrollHeight > target.clientHeight
  ) {
    cache.current = target;
    return target;
  }
  const cached = cache.current;
  if (cached?.isConnected) return cached;

  let el: HTMLElement | null = sections.current.rsvp ?? sections.current.seal ?? null;
  while (el && el !== document.documentElement) {
    if (el.scrollHeight > el.clientHeight + 4) {
      if (el === document.body || /(auto|scroll|overlay)/.test(getComputedStyle(el).overflowY)) {
        cache.current = el;
        return el;
      }
    }
    el = el.parentElement;
  }
  const fallback = document.scrollingElement ?? document.documentElement;
  cache.current = fallback;
  return fallback;
}

interface Options {
  /** Reveals stay frozen while the gate is up. */
  enabled: boolean;
  onScrollY(y: number): void;
  /** `null` under reduced motion — programmatic scrolls fall back to native. */
  lenis: Lenis | null;
}

export interface ScrollDirector {
  register: RegisterStage;
  /** 2px progress rail — written imperatively, never through state. */
  railRef: RefObject<HTMLDivElement | null>;
  /** The MAHAYA easter egg, parallaxed at 0.18× scroll. */
  parallaxRef: RefObject<HTMLDivElement | null>;
  revealed: Revealed;
  past: boolean;
  rsvpVisible: boolean;
  scrollToStage(stage: Stage): void;
  resetScroll(): void;
}

export function useScrollDirector({ enabled, onScrollY, lenis }: Options): ScrollDirector {
  const sections = useRef<Sections>({});
  const scroller = useRef<Element | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const [revealed, setRevealed] = useState<Revealed>(NONE);
  const [past, setPast] = useState(false);
  const [rsvpVisible, setRsvpVisible] = useState(false);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onScrollYRef = useRef(onScrollY);
  onScrollYRef.current = onScrollY;

  const register = useMemo(
    () =>
      Object.fromEntries(
        STAGES.map((stage) => [stage, (el: HTMLElement | null) => void (sections.current[stage] = el)]),
      ) as RegisterStage,
    [],
  );

  const check = useCallback((target: EventTarget | null = null) => {
    const sc = resolveScroller(target, scroller, sections);
    const top = sc.scrollTop;
    const max = sc.scrollHeight - sc.clientHeight;

    onScrollYRef.current(top);
    if (railRef.current) {
      railRef.current.style.transform = `scaleY(${max > 0 ? Math.min(1, top / max) : 0})`;
    }
    if (parallaxRef.current) {
      parallaxRef.current.style.marginTop = `${(top * 0.18).toFixed(1)}px`;
    }
    if (!enabledRef.current) return;

    const vh = window.innerHeight;
    setRevealed((prev) => {
      let next = prev;
      for (const stage of STAGES) {
        if (prev[stage]) continue;
        const el = sections.current[stage];
        if (el && el.getBoundingClientRect().top < vh * REVEAL_AT) {
          if (next === prev) next = { ...prev };
          next[stage] = true;
        }
      }
      return next;
    });

    const align = sections.current.align;
    if (align) setPast(align.getBoundingClientRect().top < vh * PAST_AT);

    const rsvp = sections.current.rsvp;
    if (rsvp) {
      const r = rsvp.getBoundingClientRect();
      setRsvpVisible(r.top < vh * 0.9 && r.bottom > vh * 0.1);
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = (e: Event) => {
      if (raf) return;
      const target = e.target;
      raf = requestAnimationFrame(() => {
        raf = 0;
        check(target);
      });
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    const sweep = window.setInterval(() => check(), SWEEP_MS);
    check();
    return () => {
      document.removeEventListener('scroll', onScroll, true);
      window.clearInterval(sweep);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [check]);

  const scrollToStage = useCallback(
    (stage: Stage) => {
      const el = sections.current[stage];
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el, { offset: -12 });
        return;
      }
      const sc = resolveScroller(null, scroller, sections);
      const top = el.getBoundingClientRect().top + sc.scrollTop - 12;
      sc.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [lenis],
  );

  const resetScroll = useCallback(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else resolveScroller(null, scroller, sections).scrollTo(0, 0);
    window.setTimeout(() => check(), 80);
  }, [check, lenis]);

  return { register, railRef, parallaxRef, revealed, past, rsvpVisible, scrollToStage, resetScroll };
}

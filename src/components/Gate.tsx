import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_PORTAL } from '../lib/motion';
import styles from './Gate.module.css';

const PATH_D =
  'M150,95 C112,50 56,52 56,95 C56,138 112,140 150,95 C188,50 244,52 244,95 C244,138 188,140 150,95';

/** 121 samples along the lemniscate — index 0 at the light, 120 closes it. */
const STEPS = 120;
/** Start tolerance, in viewBox units. */
const GRAB = 46;
/** Advance tolerance — loose enough for a fast, sloppy swipe. */
const FOLLOW = 26;
/** Look-ahead, so a quick drag can skip samples but a stray tap cannot finish. */
const LOOKAHEAD = 5;
const FALLBACK_AFTER = 9000;
const AUTO_TRACE = 1400;

const HINT_START = 'START AT THE LIGHT · ONE STROKE';
const HINT_DONE = '✦ INFINITY CLOSED';

interface Props {
  locked: boolean;
  onComplete(): void;
}

export default function Gate({ locked, onComplete }: Props) {
  const reduced = useReducedMotion();
  const [showFallback, setShowFallback] = useState(() => !!reduced);

  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const guideRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const autoTraceRef = useRef<(() => void) | null>(null);

  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setShowFallback(true), FALLBACK_AFTER);
    return () => window.clearTimeout(id);
  }, [reduced]);

  useEffect(() => {
    const box = boxRef.current;
    const svg = svgRef.current;
    const guide = guideRef.current;
    const fill = fillRef.current;
    const head = headRef.current;
    const hint = hintRef.current;
    if (!box || !svg || !guide || !fill || !head || !hint) return;

    // Samples are in viewBox space, so they survive any resize untouched.
    const length = guide.getTotalLength();
    const points = Array.from({ length: STEPS + 1 }, (_, i) =>
      guide.getPointAtLength((length * i) / STEPS),
    );
    fill.style.strokeDasharray = String(length);
    fill.style.strokeDashoffset = String(length);

    // Progress is a ref, not state — this runs at pointer rate.
    let idx = 0;
    let drawing = false;

    const paint = () => {
      fill.style.strokeDashoffset = String(length * (1 - idx / STEPS));
      const at = points[idx]!;
      head.setAttribute('cx', at.x.toFixed(1));
      head.setAttribute('cy', at.y.toFixed(1));
      hint.textContent =
        idx >= STEPS
          ? HINT_DONE
          : idx === 0
            ? HINT_START
            : `KEEP GOING · ${Math.round((idx / STEPS) * 100)}%`;
      if (idx >= STEPS) completeRef.current();
    };

    const toPath = (e: PointerEvent): DOMPoint | null => {
      const ctm = svg.getScreenCTM();
      return ctm ? new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()) : null;
    };

    const onDown = (e: PointerEvent) => {
      if (!lockedRef.current) return;
      const p = toPath(e);
      if (!p) return;
      const at = points[idx]!;
      if (Math.hypot(p.x - at.x, p.y - at.y) < GRAB) drawing = true;
      // Throws NotFoundError for stale/synthetic pointer ids, which would abort the handler.
      try {
        box.setPointerCapture(e.pointerId);
      } catch {
        /* not capturable — the pointer still tracks fine */
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!drawing || !lockedRef.current) return;
      const p = toPath(e);
      if (!p) return;
      for (let k = 1; k <= LOOKAHEAD; k++) {
        const j = Math.min(STEPS, idx + k);
        const q = points[j]!;
        if (Math.hypot(p.x - q.x, p.y - q.y) < FOLLOW) {
          idx = j;
          break;
        }
      }
      paint();
      if (idx >= STEPS) drawing = false;
    };

    const onUp = () => {
      drawing = false;
    };
    const block = (e: Event) => {
      if (lockedRef.current) e.preventDefault();
    };

    box.addEventListener('pointerdown', onDown);
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerup', onUp);
    box.addEventListener('pointercancel', onUp);
    // React registers wheel/touchmove passively at the root, so bind them by hand.
    box.addEventListener('wheel', block, { passive: false });
    box.addEventListener('touchmove', block, { passive: false });

    autoTraceRef.current = () => {
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / AUTO_TRACE);
        idx = Math.round(k * STEPS);
        paint();
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    return () => {
      box.removeEventListener('pointerdown', onDown);
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerup', onUp);
      box.removeEventListener('pointercancel', onUp);
      box.removeEventListener('wheel', block);
      box.removeEventListener('touchmove', block);
      autoTraceRef.current = null;
    };
  }, []);

  const onFallback = useCallback(() => {
    if (!lockedRef.current) return;
    if (reduced) completeRef.current();
    else autoTraceRef.current?.();
  }, [reduced]);

  const doors = { duration: 1.6, ease: EASE_PORTAL };

  return (
    /* data-lenis-prevent: Lenis scans composedPath() and ignores any gesture
       originating in here, so it cannot glide the page behind the gate. This
       is synchronous from first paint, unlike lenis.stop(). */
    <div className={styles.gate} data-lenis-prevent>
      <motion.div
        aria-hidden="true"
        className={`${styles.door} ${styles.left}`}
        animate={{ x: locked ? '0%' : '-103%' }}
        transition={doors}
      />
      <motion.div
        aria-hidden="true"
        className={`${styles.door} ${styles.right}`}
        animate={{ x: locked ? '0%' : '103%' }}
        transition={doors}
      />

      <motion.div
        ref={boxRef}
        className={styles.stage}
        animate={{ opacity: locked ? 1 : 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <p className={styles.date}>08 · 08 · 26</p>
        {/* Not a heading element: the page's h1 is "Yashika Mahajan", behind the gate. */}
        <p className={styles.heading}>Draw the infinity</p>

        <svg ref={svgRef} viewBox="0 0 300 190" className={styles.figure} aria-hidden="true">
          <ellipse
            cx={150}
            cy={95}
            rx={128}
            ry={66}
            fill="none"
            stroke="rgba(240,180,41,.08)"
            strokeDasharray="2 7"
          />
          <path
            ref={guideRef}
            d={PATH_D}
            fill="none"
            stroke="rgba(237,234,255,.13)"
            strokeWidth={16}
            strokeLinecap="round"
          />
          <path
            d={PATH_D}
            fill="none"
            stroke="rgba(240,180,41,.16)"
            strokeWidth={1}
            strokeDasharray="3 6"
          />
          <path
            ref={fillRef}
            d={PATH_D}
            fill="none"
            strokeWidth={9}
            strokeLinecap="round"
            className={styles.progress}
          />
          <circle
            ref={headRef}
            cx={150}
            cy={95}
            r={9}
            className={`${styles.head} anim-head-pulse`}
          />
        </svg>

        {/* Owned imperatively after mount; the JSX text never changes, so React never clobbers it. */}
        <p ref={hintRef} className={styles.hint}>
          {HINT_START}
        </p>
        <p className={styles.note}>
          eight on its side is infinity — trace it and the portal knows you
        </p>
      </motion.div>

      {showFallback && locked && (
        <button type="button" onClick={onFallback} className={styles.fallback}>
          TRACE IT FOR ME ✦
        </button>
      )}
    </div>
  );
}

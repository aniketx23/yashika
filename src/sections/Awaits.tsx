import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import Decode from '../components/Decode';
import SplitReveal from '../components/SplitReveal';
import { resolved, rise, settle } from '../lib/motion';
import shared from './section.module.css';
import styles from './Awaits.module.css';

/**
 * The four promises are plotted as an asterism running down the page. The
 * thread between them draws against scroll position and each star ignites as
 * the thread arrives, so the constellation assembles under the reader's thumb.
 *
 * `x` is a position across the rail; `m` is magnitude, weighted exactly like
 * the section star maps (`r = 1.6 + m * 1.1`, bright above 2).
 */
interface Node {
  eyebrow: string;
  title: string;
  line: string;
  x: number;
  m: number;
}

/** Rail width in px. The thread is drawn in real pixels, never a stretched viewBox. */
const RAIL = 46;
const GUTTER = 16;

const NODES: readonly Node[] = [
  {
    eyebrow: '01 · FEAST',
    title: 'The feast',
    line: 'Biryani, burgers, and things on sticks.',
    x: 30,
    m: 2.4,
  },
  {
    eyebrow: '02 · POTIONS',
    title: 'The potions',
    line: 'Mocktails, spirits, and a toast at 8:08 sharp.',
    x: 13,
    m: 1.7,
  },
  {
    eyebrow: '03 · GAMES',
    title: 'The games',
    line: 'Bingo, charades, and at least one bad decision — bring your own games and your maddest ideas.',
    x: 34,
    m: 2.9,
  },
  {
    eyebrow: '04 · POOL',
    title: 'The pool',
    line: 'Bring a spare set of clothes — this one ends up poolside.',
    x: 14,
    m: 2.2,
  },
  {
    eyebrow: '05 · PROOF',
    title: 'The proof',
    line: 'A photo wall, a memory jar, and evidence you were here.',
    x: 31,
    m: 1.9,
  },
];

interface StarProps {
  x: number;
  y: number;
  r: number;
  bright: boolean;
  at: number;
  progress: MotionValue<number>;
  reduced: boolean;
}

/** Ignites as the thread reaches it, so the asterism assembles under the thumb. */
function Star({ x, y, r, bright, at, progress, reduced }: StarProps) {
  const opacity = useTransform(progress, [at, at + 0.16], resolved(reduced, 0, 1));
  const scale = useTransform(progress, [at, at + 0.16], resolved(reduced, 0.3, 1));

  return (
    <motion.g style={{ opacity, scale, transformBox: 'fill-box', transformOrigin: 'center' }}>
      <circle cx={x} cy={y} r={r * 3.2} fill="rgba(240,180,41,.12)" />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={bright ? '#FFE9B0' : '#EDEAFF'}
        className={bright ? styles.starBright : styles.star}
      />
    </motion.g>
  );
}

interface Props {
  sectionRef(el: HTMLElement | null): void;
  revealed: boolean;
}

export default function Awaits({ sectionRef, revealed }: Props) {
  const reduced = !!useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const anchors = useRef<(HTMLParagraphElement | null)[]>([]);
  const [ys, setYs] = useState<readonly number[]>([]);
  const [height, setHeight] = useState(0);

  /* Measured, not guessed: each star sits on the centre of its eyebrow line, so
     the asterism stays locked to the copy through any wrap or font swap. */
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const top = list.getBoundingClientRect().top;
    const next = anchors.current.map((el) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return +(r.top - top + r.height / 2).toFixed(1);
    });
    setYs((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
    );
    setHeight(list.offsetHeight);
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    for (const el of anchors.current) if (el) ro.observe(el);
    void document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  const { scrollYProgress } = useScroll({
    target: listRef as RefObject<HTMLElement>,
    offset: ['start 0.85', 'end 0.6'],
  });
  const dashoffset = useTransform(scrollYProgress, [0, 1], resolved(reduced, 1, 0));

  const plotted = ys.length === NODES.length && height > 0;
  const thread = plotted ? ys.map((y, i) => `${i ? 'L' : 'M'}${NODES[i]!.x},${y}`).join(' ') : '';

  return (
    <section ref={sectionRef} className={styles.awaits}>
      <motion.div
        className={shared.centered}
        variants={rise}
        initial="hidden"
        animate={revealed ? 'shown' : 'hidden'}
        transition={settle(0.9)}
      >
        <Decode text="✦ WHAT AWAITS" active={revealed} className={shared.kicker} />
        <h2 className={`${shared.h2} ${styles.h2}`}>
          <SplitReveal text="On the other side" revealed={revealed} />
        </h2>
      </motion.div>

      <ol ref={listRef} className={styles.list} style={{ paddingInlineStart: RAIL + GUTTER }}>
        {plotted && (
          <svg
            aria-hidden="true"
            className={styles.rail}
            width={RAIL}
            height={height}
            viewBox={`0 0 ${RAIL} ${height}`}
          >
            <motion.path
              d={thread}
              fill="none"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              style={{ strokeDashoffset: dashoffset }}
              className={styles.thread}
            />
            {ys.map((y, i) => {
              const node = NODES[i]!;
              return (
                <Star
                  key={node.eyebrow}
                  x={node.x}
                  y={y}
                  r={1.6 + node.m * 1.1}
                  bright={node.m > 2}
                  at={i / NODES.length}
                  progress={scrollYProgress}
                  reduced={reduced}
                />
              );
            })}
          </svg>
        )}

        {NODES.map((node, i) => (
          <li key={node.eyebrow} className={styles.item}>
            <motion.div
              variants={rise}
              initial="hidden"
              animate={revealed ? 'shown' : 'hidden'}
              transition={settle(0.8, 0.12 + i * 0.12)}
            >
              <p ref={(el) => void (anchors.current[i] = el)} className={styles.eyebrow}>
                {node.eyebrow}
              </p>
              <h3 className={styles.title}>{node.title}</h3>
              <p className={styles.line}>{node.line}</p>
            </motion.div>
          </li>
        ))}
      </ol>
    </section>
  );
}

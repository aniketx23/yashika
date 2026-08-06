import { Fragment, useRef, type RefObject } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { resolved } from '../lib/motion';
import styles from './text.module.css';

/** Unlit words sit here until the scroll reaches them. */
const DIM = 0.16;

export interface Segment {
  text: string;
  strong?: boolean;
}

interface WordProps {
  word: string;
  strong: boolean;
  progress: MotionValue<number>;
  from: number;
  to: number;
  reduced: boolean;
}

function Word({ word, strong, progress, from, to, reduced }: WordProps) {
  const opacity = useTransform(progress, [from, to], resolved(reduced, DIM, 1));
  return (
    <motion.span className={styles.litWord} style={{ opacity }}>
      {strong ? <strong>{word}</strong> : word}
    </motion.span>
  );
}

interface Props {
  segments: readonly Segment[];
  className?: string | undefined;
}

/**
 * The paragraph lights word by word as the section crosses the viewport — the
 * portal illuminating the message. Every word is driven by a `MotionValue`, so
 * scrolling never re-renders React.
 */
export default function ScrollLitText({ segments, className }: Props) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement>,
    offset: ['start 0.92', 'end 0.6'],
  });

  const words = segments.flatMap((segment) =>
    segment.text
      .split(' ')
      .filter(Boolean)
      .map((word) => ({ word, strong: !!segment.strong })),
  );
  const total = words.length;
  const plain = words.map((w) => w.word).join(' ');

  return (
    <p ref={ref} className={className}>
      <span className={styles.srOnly}>{plain}</span>
      <span aria-hidden="true">
        {words.map((entry, i) => (
          <Fragment key={`${entry.word}-${i}`}>
            <Word
              word={entry.word}
              strong={entry.strong}
              progress={scrollYProgress}
              reduced={reduced}
              /* Overlapping slices, so the light sweeps rather than steps.
                 Clamped, or the tail words never reach full brightness. */
              from={i / total}
              to={Math.min(1, (i + 1.7) / total)}
            />
            {i < total - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </p>
  );
}

import type { Transition, Variants } from 'motion/react';

/** Standard settle — expo-out, luxurious. */
export const EASE_SETTLE: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Portal / mechanical. */
export const EASE_PORTAL: [number, number, number, number] = [0.87, 0, 0.13, 1];

/** One-way section reveal: opacity 0→1, translateY 28→0. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  shown: { opacity: 1, y: 0 },
};

export const settle = (duration: number, delay = 0): Transition =>
  delay ? { duration, ease: EASE_SETTLE, delay } : { duration, ease: EASE_SETTLE };

/** Parent variant that walks its `rise` children in. */
export const stagger = (delayChildren: number, staggerChildren = delayChildren): Variants => ({
  hidden: {},
  shown: { transition: { delayChildren, staggerChildren } },
});


/**
 * Collapse a scroll-linked output range to its settled value.
 *
 * `MotionConfig reducedMotion` only governs *animations* — a `useTransform`
 * bound straight to `style` is not one, so scroll-linked motion has to be
 * neutralised by hand or it keeps running for people who asked it not to.
 */
export const resolved = <T,>(reduced: boolean, from: T, to: T): [T, T] =>
  reduced ? [to, to] : [from, to];

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

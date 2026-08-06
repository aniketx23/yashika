import { useEffect, useState } from 'react';

export interface Remaining {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  /** The portal has peaked. */
  done: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

function split(target: number): Remaining {
  const t = Math.max(0, target - Date.now());
  return {
    days: pad(Math.floor(t / 864e5)),
    hours: pad(Math.floor(t / 36e5) % 24),
    minutes: pad(Math.floor(t / 6e4) % 60),
    seconds: pad(Math.floor(t / 1e3) % 60),
    done: t === 0,
  };
}

const same = (a: Remaining, b: Remaining) =>
  a.seconds === b.seconds &&
  a.minutes === b.minutes &&
  a.hours === b.hours &&
  a.days === b.days &&
  a.done === b.done;

/**
 * Ticks at 500ms but only commits when a digit actually changes, so the tree
 * re-renders once a second at most.
 */
export function useCountdown(target: number): Remaining {
  const [remaining, setRemaining] = useState(() => split(target));

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        const next = split(target);
        return same(prev, next) ? prev : next;
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [target]);

  return remaining;
}

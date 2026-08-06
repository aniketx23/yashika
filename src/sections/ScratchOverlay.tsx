import { useEffect, useRef, type RefObject } from 'react';
import { motion } from 'motion/react';
import styles from './Countdown.module.css';

/** Coverage grid; the 3×3 neighbourhood of every touched cell counts as cleared. */
const COLS = 16;
const ROWS = 12;
const DONE_AT = 0.5;
const SPECKS = 700;
const BRUSH = 58;
const DAB = 29;

interface Props {
  /** The panel the canvas covers — the source of truth for its size. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** Coverage crossed the threshold. Idempotent on the parent's side. */
  onCleared(): void;
  /** True once the reveal has fired, from either this canvas or the tap fallback. */
  cleared: boolean;
}

export default function ScratchOverlay({ panelRef, onCleared, cleared }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clearedRef = useRef(onCleared);
  clearedRef.current = onCleared;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cells = new Set<number>();
    let ctx: CanvasRenderingContext2D | null = null;
    let width = 0;
    let height = 0;
    let started = false;
    let scratching = false;
    let last: { x: number; y: number } | null = null;

    const paint = () => {
      if (!canvas.isConnected) return;
      const rect = (panelRef.current ?? canvas).getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const c = canvas.getContext('2d')!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = rect.width;
      height = rect.height;

      const night = c.createLinearGradient(0, 0, width, height);
      night.addColorStop(0, '#191540');
      night.addColorStop(0.5, '#100e2c');
      night.addColorStop(1, '#1c1746');
      c.fillStyle = night;
      c.fillRect(0, 0, width, height);

      for (let i = 0; i < SPECKS; i++) {
        c.fillStyle =
          Math.random() < 0.3
            ? `rgba(240,180,41,${0.06 + Math.random() * 0.32})`
            : `rgba(237,234,255,${0.04 + Math.random() * 0.26})`;
        const s = Math.random() * 2 + 0.4;
        c.fillRect(Math.random() * width, Math.random() * height, s, s);
      }

      c.textAlign = 'center';
      c.fillStyle = 'rgba(240,180,41,.88)';
      c.font = '700 12px "Space Mono", monospace';
      c.fillText('✦  S C R A T C H   T H E   S T A R D U S T  ✦', width / 2, height / 2 - 8);
      c.fillStyle = 'rgba(156,151,196,.7)';
      c.font = '11px Manrope, sans-serif';
      c.fillText('rub away the night to reveal your coordinates', width / 2, height / 2 + 16);

      ctx = c;
    };

    const erase = (x: number, y: number) => {
      if (!ctx) {
        paint();
        if (!ctx) return;
      }
      started = true;
      const c = ctx;
      c.globalCompositeOperation = 'destination-out';
      c.lineWidth = BRUSH;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      c.moveTo(last?.x ?? x, last?.y ?? y);
      c.lineTo(x, y);
      c.stroke();
      c.beginPath();
      c.arc(x, y, DAB, 0, 7);
      c.fill();
      c.globalCompositeOperation = 'source-over';
      last = { x, y };

      const col = Math.floor(x / (width / COLS));
      const row = Math.floor(y / (height / ROWS));
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cc = col + dx;
          const rr = row + dy;
          if (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS) cells.add(rr * COLS + cc);
        }
      }
      if (cells.size / (COLS * ROWS) >= DONE_AT) clearedRef.current();
    };

    const at = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      scratching = true;
      last = null;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* stale or synthetic pointer id — tracking still works */
      }
      const p = at(e);
      erase(p.x, p.y);
    };
    const onMove = (e: PointerEvent) => {
      if (!scratching) return;
      const p = at(e);
      erase(p.x, p.y);
    };
    const onUp = () => {
      scratching = false;
      last = null;
    };

    const frame = requestAnimationFrame(paint);
    // Web fonts land after first paint; repaint while the stardust is untouched.
    void document.fonts?.ready.then(() => {
      if (!started && canvas.isConnected) paint();
    });

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [panelRef]);

  return (
    <motion.canvas
      ref={canvasRef}
      aria-hidden="true"
      className={styles.scratch}
      style={{ pointerEvents: cleared ? 'none' : 'auto' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    />
  );
}

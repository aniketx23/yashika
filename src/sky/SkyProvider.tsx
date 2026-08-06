import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import { SkyEngine } from '../lib/sky';
import styles from './SkyProvider.module.css';

export interface SkyApi {
  /** Bloom + star warp at normalised viewport coords. Skipped under reduced motion. */
  bloom(x: number, y: number, duration: number): void;
  setScrollY(y: number): void;
  /** Signed px per frame (Lenis units). Smears the star field along the direction of travel. */
  setVelocity(v: number): void;
}

const SkyContext = createContext<SkyApi | null>(null);

export function useSky(): SkyApi {
  const api = useContext(SkyContext);
  if (!api) throw new Error('useSky must be used inside <SkyProvider>');
  return api;
}

interface Props {
  meteorRate: number;
  children: ReactNode;
}

export function SkyProvider({ meteorRate, children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SkyEngine | null>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new SkyEngine(canvas, meteorRate);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [meteorRate]);

  const api = useMemo<SkyApi>(
    () => ({
      bloom(x, y, duration) {
        if (reducedRef.current) return;
        engineRef.current?.bloom(x, y, duration);
      },
      setScrollY(y) {
        const engine = engineRef.current;
        if (engine) engine.scrollY = y;
      },
      setVelocity(v) {
        const engine = engineRef.current;
        if (engine) engine.scrollVelocity = reducedRef.current ? 0 : v;
      },
    }),
    [],
  );

  return (
    <SkyContext.Provider value={api}>
      <canvas ref={canvasRef} aria-hidden="true" className={styles.sky} />
      {children}
    </SkyContext.Provider>
  );
}

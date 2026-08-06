import { useCallback, useEffect, useRef, useState } from 'react';
import track from '../assets/never-stop-trying.mp3';

declare global {
  interface Window {
    /** Legacy Safari alias, still needed on older iOS. */
    webkitAudioContext?: typeof AudioContext;
  }
}

/** Matches the page's motion timings: slow swell in, quick duck out. */
const FADE_IN = 1.8;
const FADE_OUT = 0.5;
/** Sits under the page rather than on top of it. */
const LEVEL = 0.7;
/** `exponentialRampToValueAtTime` cannot touch zero. */
const SILENT = 0.0001;

interface Rig {
  el: HTMLAudioElement;
  ctx: AudioContext | null;
  gain: GainNode | null;
}

export interface AmbientSound {
  on: boolean;
  toggle(): void;
}

/**
 * The soundtrack rides a Web Audio `GainNode`, not `element.volume` — iOS makes
 * media-element volume read-only, so a volume fade there would simply snap the
 * song on at full blast. Falls back to `volume` if the graph can't be built.
 */
function fade(rig: Rig, up: boolean): void {
  const { ctx, gain } = rig;
  if (ctx && gain) {
    const at = ctx.currentTime;
    gain.gain.cancelScheduledValues(at);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, SILENT), at);
    gain.gain.exponentialRampToValueAtTime(up ? LEVEL : SILENT, at + (up ? FADE_IN : FADE_OUT));
    return;
  }
  rig.el.volume = up ? LEVEL : 0;
}

/**
 * Muted by default and lazily loaded: the audio file is not fetched until the
 * guest actually asks for sound, so nobody pays ~3.9 MB of mobile data for a
 * soundtrack they never turned on.
 */
export function useAmbientSound(): AmbientSound {
  const [on, setOn] = useState(false);
  const rigRef = useRef<Rig | null>(null);
  const stopRef = useRef(0);
  const onRef = useRef(on);
  onRef.current = on;

  useEffect(
    () => () => {
      const rig = rigRef.current;
      if (!rig) return;
      window.clearTimeout(stopRef.current);
      rig.el.pause();
      rig.el.removeAttribute('src');
      rig.el.remove();
      void rig.ctx?.close();
      rigRef.current = null;
    },
    [],
  );

  const toggle = useCallback(() => {
    let rig = rigRef.current;

    if (!rig) {
      const el = document.createElement('audio');
      // preload before src: setting src first would start a fetch immediately.
      el.preload = 'none';
      el.loop = true;
      el.src = track;
      /* Attached, not detached: iOS is unreliable about playing media elements
         that were never inserted into the document. */
      el.hidden = true;
      document.body.append(el);

      let ctx: AudioContext | null = null;
      let gain: GainNode | null = null;
      try {
        const Ctor = window.AudioContext ?? window.webkitAudioContext;
        if (Ctor) {
          ctx = new Ctor();
          gain = ctx.createGain();
          gain.gain.value = SILENT;
          ctx.createMediaElementSource(el).connect(gain);
          gain.connect(ctx.destination);
        }
      } catch {
        ctx = null;
        gain = null;
      }
      if (!gain) el.volume = 0;

      rig = { el, ctx, gain };
      rigRef.current = rig;
    }

    const settled = rig;
    const next = !onRef.current;
    window.clearTimeout(stopRef.current);

    if (next) {
      void settled.ctx?.resume();
      void settled.el.play().catch(() => {
        /* blocked before a gesture lands — the next tap will take */
      });
      fade(settled, true);
    } else {
      fade(settled, false);
      // Free the stream once it is inaudible, not the instant it is toggled.
      stopRef.current = window.setTimeout(() => settled.el.pause(), FADE_OUT * 1000 + 80);
    }
    setOn(next);
  }, []);

  return { on, toggle };
}

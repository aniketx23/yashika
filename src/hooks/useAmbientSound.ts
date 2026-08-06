import { useCallback, useEffect, useRef, useState } from 'react';
import loop from '../assets/portal-loop.mp3';

declare global {
  interface Window {
    /** Legacy Safari alias, still needed on older iOS. */
    webkitAudioContext?: typeof AudioContext;
  }
}

const FADE_IN = 1.4;
const FADE_OUT = 0.5;
/** Slider moves ride a short ramp so dragging doesn't zipper. */
const SETTLE = 0.08;
export const DEFAULT_VOLUME = 0.7;
/** `exponentialRampToValueAtTime` cannot touch zero. */
const SILENT = 0.0001;
/** Anything quieter than this counts as silence when finding the loop points. */
const FLOOR = 0.0025;

interface Rig {
  ctx: AudioContext;
  gain: GainNode;
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  start: number;
  end: number;
}

export interface AmbientSound {
  on: boolean;
  toggle(): void;
  /** 0–1. */
  volume: number;
  setVolume(v: number): void;
}

/**
 * Find the first and last audible samples.
 *
 * MP3 encoding pads both ends of the file, and looping across that padding
 * puts an audible gap in every lap — brutal on a 14-second bed. Setting
 * `loopStart`/`loopEnd` to the real audio makes the seam sample-accurate.
 */
function findLoop(buffer: AudioBuffer): { start: number; end: number } {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
    buffer.getChannelData(i),
  );
  const audible = (i: number) => channels.some((c) => Math.abs(c[i] ?? 0) > FLOOR);

  let first = 0;
  while (first < buffer.length && !audible(first)) first++;
  let last = buffer.length - 1;
  while (last > first && !audible(last)) last--;

  return { start: first / buffer.sampleRate, end: (last + 1) / buffer.sampleRate };
}

function ramp(rig: Rig, to: number, seconds: number): void {
  const at = rig.ctx.currentTime;
  rig.gain.gain.cancelScheduledValues(at);
  rig.gain.gain.setValueAtTime(Math.max(rig.gain.gain.value, SILENT), at);
  rig.gain.gain.exponentialRampToValueAtTime(Math.max(to, SILENT), at + seconds);
}

/**
 * Muted by default, lazily fetched: the clip is not downloaded until the guest
 * asks for sound, so nobody pays for a soundtrack they never turned on.
 *
 * Played through an `AudioBufferSourceNode` rather than an `<audio>` element —
 * that is what buys a gapless loop, and it keeps gain on a `GainNode`, which
 * matters because iOS makes media-element volume read-only.
 */
export function useAmbientSound(): AmbientSound {
  const [on, setOn] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  const rigRef = useRef<Rig | null>(null);
  const stopRef = useRef(0);
  const busyRef = useRef(false);
  const onRef = useRef(on);
  onRef.current = on;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  useEffect(
    () => () => {
      const rig = rigRef.current;
      if (!rig) return;
      window.clearTimeout(stopRef.current);
      try {
        rig.source?.stop();
      } catch {
        /* already stopped */
      }
      void rig.ctx.close();
      rigRef.current = null;
    },
    [],
  );

  const toggle = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    void (async () => {
      try {
        let rig = rigRef.current;
        if (!rig) {
          const Ctor = window.AudioContext ?? window.webkitAudioContext;
          if (!Ctor) return;
          const ctx = new Ctor();
          const gain = ctx.createGain();
          gain.gain.value = SILENT;
          gain.connect(ctx.destination);
          rig = { ctx, gain, buffer: null, source: null, start: 0, end: 0 };
          rigRef.current = rig;
        }

        if (onRef.current) {
          window.clearTimeout(stopRef.current);
          ramp(rig, 0, FADE_OUT);
          const dying = rig.source;
          rig.source = null;
          // Let it fade before killing the node, then release the decoder.
          stopRef.current = window.setTimeout(() => {
            try {
              dying?.stop();
            } catch {
              /* already stopped */
            }
          }, FADE_OUT * 1000 + 80);
          setOn(false);
          return;
        }

        await rig.ctx.resume();
        if (!rig.buffer) {
          const bytes = await (await fetch(loop)).arrayBuffer();
          const buffer = await rig.ctx.decodeAudioData(bytes);
          // The component may have unmounted across those awaits.
          if (rigRef.current !== rig) return;
          const points = findLoop(buffer);
          rig.buffer = buffer;
          rig.start = points.start;
          rig.end = points.end;
        }

        window.clearTimeout(stopRef.current);
        if (!rig.source) {
          const source = rig.ctx.createBufferSource();
          source.buffer = rig.buffer;
          source.loop = true;
          source.loopStart = rig.start;
          source.loopEnd = rig.end;
          source.connect(rig.gain);
          source.start(0, rig.start);
          rig.source = source;
        }
        ramp(rig, volumeRef.current, FADE_IN);
        setOn(true);
      } finally {
        busyRef.current = false;
      }
    })();
  }, []);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    const rig = rigRef.current;
    if (rig && onRef.current) ramp(rig, clamped, SETTLE);
  }, []);

  return { on, toggle, volume, setVolume };
}

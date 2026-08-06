import { useMemo, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  MAP_VIEWBOX,
  NAME_WIDTH,
  plotLines,
  plotStars,
  type MapConfig,
} from '../lib/constellations';
import shared from '../sections/section.module.css';

interface Props {
  config: MapConfig;
  revealed: boolean;
}

/**
 * The decorative section star maps. Lines draw themselves in via `pathLength`,
 * stars fade in behind them, and the whole plate drifts against the scroll.
 *
 * The constellation name is the only text here and it sits underneath
 * everything — same treatment as MAHAYA in the hero: oversized Bodoni, barely
 * there. It drifts the opposite way to the drawing, which buys depth for free.
 * Member stars carry no labels.
 *
 * The parallax lives on the inner elements, never on the measured box: moving
 * the thing you measure feeds a transform back into its own scroll offset.
 */
export default function ConstellationMap({ config, revealed }: Props) {
  const reduced = !!useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const stars = useMemo(() => plotStars(config.stars), [config.stars]);
  const lines = useMemo(() => plotLines(config.stars, config.edges), [config.stars, config.edges]);
  const glow = config.lineGlow ? 'drop-shadow(0 0 4px rgba(240,180,41,.5))' : 'none';

  const { scrollYProgress } = useScroll({
    target: boxRef,
    offset: ['start end', 'end start'],
  });
  const plateY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-6%', '6%']);
  const nameY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [26, -26]);

  return (
    <div ref={boxRef} aria-hidden="true" className={shared.map} style={config.placement}>
      <motion.svg
        viewBox={`0 0 ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`}
        className={shared.mapPlate}
        style={{ y: plateY }}
      >
        <motion.g style={{ y: nameY }}>
          <text
            x={MAP_VIEWBOX.w / 2}
            y={config.nameY}
            textAnchor="middle"
            textLength={NAME_WIDTH}
            lengthAdjust="spacing"
            fontFamily="Bodoni Moda,serif"
            fontWeight={500}
            fontSize={config.nameSize}
            className={shared.mapName}
          >
            {config.name}
          </text>
        </motion.g>

        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={config.lineStroke}
            strokeWidth={1}
            pathLength={1}
            strokeDasharray={1}
            style={{
              strokeDashoffset: revealed ? 0 : 1,
              transition: `stroke-dashoffset ${config.lineDuration}s var(--ease-settle) ${line.delay}s`,
              filter: glow,
            }}
          />
        ))}

        {stars.map((star, i) => (
          <g
            key={i}
            style={{
              opacity: revealed ? 1 : 0,
              transition: `opacity .9s ease ${star.delay}s`,
            }}
          >
            <circle cx={star.x} cy={star.y} r={star.halo} fill={config.haloFill} />
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill={star.fill}
              style={{ filter: star.glow }}
            />
          </g>
        ))}
      </motion.svg>
    </div>
  );
}

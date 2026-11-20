import React from 'react';
import { FlowerId } from '../types/app';

interface BreathingFlowerProps {
  flowerId: FlowerId;
  /** 0 = tightly gathered bud (contract/hold), 1 = completely open relaxed blossom */
  openness: number;
  /** 0..1 warm core glow (strongest during contract & hold) */
  glow: number;
  /** subtle breathing micro-scale pulse during hold or idle */
  pulse?: number;
  isPureRelax?: boolean;
}

/**
 * Smooth organic SVG flower whose petals curl smoothly into a luminous bud on contraction
 * and unfurl wide and light on relaxation, inspired by hand-drawn picture-book florals.
 */
export const BreathingFlower: React.FC<BreathingFlowerProps> = ({
  flowerId,
  openness,
  glow,
  pulse = 0,
  isPureRelax = false,
}) => {
  const clampedOpen = Math.max(0, Math.min(1, openness));
  const clampedGlow = Math.max(0, Math.min(1, glow));

  // Palette per flower species (all harmonized in soft low-saturation watercolor)
  const palette = isPureRelax
    ? {
        outer: '#DCE7DF',
        inner: '#FAF7F2',
        stroke: '#8FA998',
        center: '#E8C696',
        halo: '#8FA998',
        petalCount: 10,
      }
    : flowerId === 'daisy'
      ? {
          outer: '#F7EFE2',
          inner: '#FFFDF8',
          stroke: '#DFC59F',
          center: '#E8C696',
          halo: '#E8C696',
          petalCount: 12,
        }
      : flowerId === 'chamomile'
        ? {
            outer: '#F5E4C3',
            inner: '#FFFDF8',
            stroke: '#D9B682',
            center: '#E0B272',
            halo: '#E8C696',
            petalCount: 12,
          }
        : flowerId === 'tulip'
          ? {
              outer: '#DFB1AF',
              inner: '#F3D6D3',
              stroke: '#C58F8D',
              center: '#E8C696',
              halo: '#D9A7A7',
              petalCount: 8,
            }
          : {
              outer: '#E7ECE8',
              inner: '#FAF3EE',
              stroke: '#8FA998',
              center: '#E8C696',
              halo: '#D9A7A7',
              petalCount: 10,
            };

  // Geometric morph values driven smoothly by openness (0 = gathered bud, 1 = wide open)
  const outerDistance = 26 + clampedOpen * 46; // 26 -> 72
  const outerRx = 16 + clampedOpen * 10; // wider when open
  const outerRy = 34 + clampedOpen * 14; // extends when open
  const outerRotationDrift = (1 - clampedOpen) * 14; // gentle spiral curl as petals gather

  const innerDistance = 17 + clampedOpen * 30;
  const innerRx = 13 + clampedOpen * 7;
  const innerRy = 26 + clampedOpen * 11;
  const innerRotationDrift = -(1 - clampedOpen) * 18;

  const coreScale = 1 + (1 - clampedOpen) * 0.16 + pulse * 0.05;
  const overallScale = 0.86 + clampedOpen * 0.18 + pulse * 0.03;

  const outerPetals = Array.from({ length: palette.petalCount }, (_, i) =>
    (i / palette.petalCount) * 360
  );
  const innerPetals = Array.from({ length: palette.petalCount }, (_, i) =>
    ((i + 0.5) / palette.petalCount) * 360
  );

  // Floating gentle pollen motes that expand gently when petals relax open
  const motes = [0, 60, 120, 180, 240, 300];

  return (
    <div className="relative flex items-center justify-center w-full max-w-[300px] aspect-square select-none">
      <svg
        viewBox="-150 -150 300 300"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label="花朵呼吸动态引导动画"
      >
        <defs>
          <radialGradient id="flowerAura" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor={palette.halo}
              stopOpacity={0.18 + clampedGlow * 0.36}
            />
            <stop
              offset="62%"
              stopColor={palette.halo}
              stopOpacity={0.07 + clampedGlow * 0.14}
            />
            <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="warmHeartGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF7E2" stopOpacity={0.7 + clampedGlow * 0.3} />
            <stop offset="55%" stopColor="#E8C696" stopOpacity={0.55 + clampedGlow * 0.38} />
            <stop offset="100%" stopColor="#D9A7A7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer soft watercolor breathing aura */}
        <circle
          cx="0"
          cy="0"
          r={92 + clampedOpen * 44 + pulse * 6}
          fill="url(#flowerAura)"
        />

        {/* Delicate dotted botanical compass ring */}
        <circle
          cx="0"
          cy="0"
          r={86 + clampedOpen * 32}
          fill="none"
          stroke={palette.stroke}
          strokeWidth="1.1"
          strokeDasharray="3 7"
          opacity={0.28 + clampedOpen * 0.18}
        />

        {/* Floating pollen / dew motes */}
        {motes.map((deg, idx) => {
          const rad = ((deg + clampedOpen * 22) * Math.PI) / 180;
          const dist = 62 + clampedOpen * 54 + (idx % 2 === 0 ? 8 : -4);
          return (
            <circle
              key={deg}
              cx={Math.cos(rad) * dist}
              cy={Math.sin(rad) * dist}
              r={2.2 + clampedOpen * 1.4}
              fill={idx % 2 === 0 ? '#E8C696' : '#8FA998'}
              opacity={0.25 + clampedOpen * 0.5}
            />
          );
        })}

        {/* Main animated blossom group */}
        <g transform={`scale(${overallScale})`}>
          {/* Soft sage sepal leaves peeking behind when relaxed */}
          {[30, 150, 270].map((deg) => (
            <g key={deg} transform={`rotate(${deg + clampedOpen * 10})`}>
              <path
                d={`M0 -18 C-14 ${-42 - clampedOpen * 30} -10 ${-66 - clampedOpen * 42} 0 ${-76 - clampedOpen * 44} C10 ${-66 - clampedOpen * 42} 14 ${-42 - clampedOpen * 30} 0 -18 Z`}
                fill="#8FA998"
                opacity={0.22 + clampedOpen * 0.42}
              />
            </g>
          ))}

          {/* Outer petal layer */}
          <g transform={`rotate(${outerRotationDrift})`}>
            {outerPetals.map((deg, i) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <ellipse
                  cx="0"
                  cy={-outerDistance}
                  rx={outerRx}
                  ry={outerRy}
                  fill={palette.outer}
                  stroke={palette.stroke}
                  strokeWidth="1.4"
                  opacity={0.86 + clampedOpen * 0.12}
                />
                {/* Delicate picture-book center vein on alternating petals */}
                {i % 2 === 0 && (
                  <line
                    x1="0"
                    y1={-outerDistance + outerRy * 0.45}
                    x2="0"
                    y2={-outerDistance - outerRy * 0.35}
                    stroke={palette.stroke}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    opacity={0.42}
                  />
                )}
              </g>
            ))}
          </g>

          {/* Inner petal layer */}
          <g transform={`rotate(${innerRotationDrift})`}>
            {innerPetals.map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <ellipse
                  cx="0"
                  cy={-innerDistance}
                  rx={innerRx}
                  ry={innerRy}
                  fill={palette.inner}
                  stroke={palette.stroke}
                  strokeWidth="1.2"
                  opacity={0.94}
                />
              </g>
            ))}
          </g>

          {/* Warm luminous glow radiating from flower heart during contraction & hold */}
          <circle
            cx="0"
            cy="0"
            r={38 + clampedGlow * 28}
            fill="url(#warmHeartGlow)"
            opacity={0.25 + clampedGlow * 0.75}
          />

          {/* Flower heart core with hand-drawn pollen dots */}
          <g transform={`scale(${coreScale})`}>
            <circle
              cx="0"
              cy="0"
              r="24"
              fill={palette.center}
              stroke="#FFFDF8"
              strokeWidth="2"
            />
            <circle
              cx="0"
              cy="0"
              r="16"
              fill="#FFF4DD"
              opacity={0.4 + clampedGlow * 0.5}
            />
            {[
              [-7, -5],
              [7, -5],
              [0, -9],
              [-9, 3],
              [9, 3],
              [-4, 8],
              [4, 8],
              [0, 1],
            ].map(([dx, dy], idx) => (
              <circle
                key={idx}
                cx={dx}
                cy={dy}
                r="2"
                fill="#A87A42"
                opacity={0.55 + (1 - clampedGlow) * 0.25}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};

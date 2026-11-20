import React from 'react';
import { FlowerId } from '../types/app';

interface PressedSpecimenSvgProps {
  flowerId: FlowerId;
  unlocked: boolean;
  className?: string;
}

/**
 * Hand-drawn pressed dried flower specimen art for the Herbarium Journal wall.
 * Unlocked = rich watercolor pressed specimen; locked = soft gentle pencil sketch outline.
 */
export const PressedSpecimenSvg: React.FC<PressedSpecimenSvgProps> = ({
  flowerId,
  unlocked,
  className = 'w-24 h-28',
}) => {
  const strokeColor = unlocked ? '#7A8F81' : '#C6BDB3';
  const stemOpacity = unlocked ? 1 : 0.45;

  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      role="img"
      aria-label={`${flowerId} 干花标本`}
    >
      {/* Pressed stem */}
      <path
        d="M58 128 Q54 92 60 54"
        stroke={strokeColor}
        strokeWidth={unlocked ? '3.5' : '2'}
        strokeLinecap="round"
        strokeDasharray={unlocked ? undefined : '4 4'}
        fill="none"
        opacity={stemOpacity}
      />

      {/* Pressed pair of leaves */}
      <path
        d="M57 104 C38 96 28 84 32 76 C44 77 54 88 57 101 Z"
        fill={unlocked ? '#8FA998' : 'none'}
        stroke={strokeColor}
        strokeWidth="1.5"
        opacity={unlocked ? 0.9 : 0.4}
      />
      <path
        d="M58 94 C78 86 88 74 84 66 C72 67 62 78 58 91 Z"
        fill={unlocked ? '#A6BA9F' : 'none'}
        stroke={strokeColor}
        strokeWidth="1.5"
        opacity={unlocked ? 0.9 : 0.4}
      />

      {/* Flower head by species */}
      {flowerId === 'daisy' && (
        <g transform="translate(60, 44)">
          {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => (
            <ellipse
              key={deg}
              transform={`rotate(${deg})`}
              cx="0"
              cy="-18"
              rx="5.5"
              ry="13"
              fill={unlocked ? '#FFFDF8' : 'none'}
              stroke={unlocked ? '#DFC29A' : '#C6BDB3'}
              strokeWidth="1.3"
            />
          ))}
          <circle
            cx="0"
            cy="0"
            r="10"
            fill={unlocked ? '#E8C696' : 'none'}
            stroke={unlocked ? '#D3AC73' : '#C6BDB3'}
            strokeWidth="1.3"
          />
        </g>
      )}

      {flowerId === 'chamomile' && (
        <g transform="translate(60, 46)">
          {[
            { x: 0, y: -6, s: 1 },
            { x: -22, y: 12, s: 0.65 },
            { x: 22, y: 14, s: 0.62 },
          ].map((b, idx) => (
            <g key={idx} transform={`translate(${b.x}, ${b.y}) scale(${b.s})`}>
              {Array.from({ length: 10 }, (_, i) => i * 36).map((deg) => (
                <ellipse
                  key={deg}
                  transform={`rotate(${deg})`}
                  cx="0"
                  cy="-15"
                  rx="4.6"
                  ry="10"
                  fill={unlocked ? '#FAF4E8' : 'none'}
                  stroke={unlocked ? '#DFBC87' : '#C6BDB3'}
                  strokeWidth="1.2"
                />
              ))}
              <circle
                cx="0"
                cy="0"
                r="9"
                fill={unlocked ? '#E2B473' : 'none'}
                stroke={unlocked ? '#C99652' : '#C6BDB3'}
                strokeWidth="1.2"
              />
            </g>
          ))}
        </g>
      )}

      {flowerId === 'tulip' && (
        <g transform="translate(60, 46)">
          <ellipse
            cx="-10"
            cy="-6"
            rx="11"
            ry="20"
            transform="rotate(-14 -10 -6)"
            fill={unlocked ? '#E8C696' : 'none'}
            stroke={unlocked ? '#D6AF79' : '#C6BDB3'}
            strokeWidth="1.2"
          />
          <ellipse
            cx="10"
            cy="-6"
            rx="11"
            ry="20"
            transform="rotate(14 10 -6)"
            fill={unlocked ? '#E8C696' : 'none'}
            stroke={unlocked ? '#D6AF79' : '#C6BDB3'}
            strokeWidth="1.2"
          />
          <path
            d="M-21 -14 C-21 12 -10 18 0 18 C10 18 21 12 21 -14 C12 -5 6 -6 0 -20 C-6 -6 -12 -5 -21 -14 Z"
            fill={unlocked ? '#D9A7A7' : 'none'}
            stroke={unlocked ? '#C28B8B' : '#C6BDB3'}
            strokeWidth="1.4"
          />
        </g>
      )}

      {flowerId === 'lily' && (
        <g>
          <path
            d="M60 54 Q52 26 84 32"
            stroke={strokeColor}
            strokeWidth={unlocked ? '3' : '1.8'}
            strokeDasharray={unlocked ? undefined : '4 4'}
            fill="none"
            opacity={stemOpacity}
          />
          {[
            { x: 54, y: 46, s: 0.92 },
            { x: 70, y: 36, s: 0.95 },
            { x: 86, y: 42, s: 0.82 },
          ].map((b, idx) => (
            <g key={idx} transform={`translate(${b.x}, ${b.y}) scale(${b.s})`}>
              <path
                d="M-10 10 C-10 -4 -5 -7 0 -7 C5 -7 10 -4 10 10 Q5 5 0 11 Q-5 5 -10 10 Z"
                fill={unlocked ? '#F7ECE6' : 'none'}
                stroke={unlocked ? '#D9A7A7' : '#C6BDB3'}
                strokeWidth="1.4"
              />
              {unlocked && (
                <>
                  <circle cx="-2.5" cy="14" r="1.6" fill="#E8C696" />
                  <circle cx="2.5" cy="14" r="1.6" fill="#E8C696" />
                </>
              )}
            </g>
          ))}
        </g>
      )}

      {/* Archival washi-tape strip holding stem */}
      <rect
        x="43"
        y="108"
        width="34"
        height="10"
        rx="2"
        transform="rotate(-8 60 113)"
        fill={unlocked ? '#E8C696' : '#E2DBD1'}
        opacity={unlocked ? 0.52 : 0.35}
      />
    </svg>
  );
};

import React from 'react';
import { FlowerId, GrowthSubStage } from '../types/app';

interface BotanicalPotProps {
  flowerId: FlowerId;
  subStage: GrowthSubStage;
  isBrandNew: boolean; // totalKegelSessions === 0
  dampSoil?: boolean;
  showRain?: boolean;
  showRestStamp?: boolean;
  showMorningMist?: boolean;
  showSunDew?: boolean;
  growthPulse?: boolean;
  className?: string;
}

/**
 * Picture-book gouache & colored-pencil botanical potted plant illustration.
 * Styled with striped organic leaves, scalloped petals, dotted centers, and curly stamens.
 */
export const BotanicalPot: React.FC<BotanicalPotProps> = ({
  flowerId,
  subStage,
  isBrandNew,
  dampSoil = false,
  showRain = false,
  showRestStamp = false,
  showMorningMist = false,
  showSunDew = false,
  growthPulse = false,
  className = '',
}) => {
  const soilColor = dampSoil ? '#766151' : '#A68D78';
  const soilShadow = dampSoil ? '#5E4B3D' : '#8C7460';

  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 320 330"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label="成长中的治愈系植物盆栽插画"
      >
        <defs>
          {/* Soft watercolor paper warmth halo */}
          <radialGradient id="potBackdropHalo" cx="50%" cy="46%" r="48%">
            <stop offset="0%" stopColor="#E8C696" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#D9A7A7" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
          </radialGradient>

          {/* Warm sunlight beam gradient */}
          <linearGradient id="sunBeamGrad" x1="0%" y1="0%" x2="35%" y2="100%">
            <stop offset="0%" stopColor="#E8C696" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#E8C696" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#E8C696" stopOpacity="0" />
          </linearGradient>

          {/* Subtle organic watercolor edge texture */}
          <filter id="softPaperEdge" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Diagonal leaf stripe pattern inspired by picture-book reference */}
          <pattern
            id="leafStripesSage"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(32)"
          >
            <rect width="8" height="8" fill="#8FA998" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#6F8A79" strokeWidth="2.5" />
          </pattern>

          <pattern
            id="leafStripesWarm"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-28)"
          >
            <rect width="7" height="7" fill="#A5B89E" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="#FAF7F2" strokeWidth="1.6" strokeOpacity="0.65" />
          </pattern>

          <pattern
            id="potStripeBand"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <rect width="10" height="10" fill="#E6D8C7" />
            <line x1="5" y1="0" x2="5" y2="10" stroke="#D9A7A7" strokeWidth="2.4" strokeOpacity="0.48" />
          </pattern>
        </defs>

        {/* Ambient watercolor halo behind pot */}
        <circle cx="160" cy="155" r="136" fill="url(#potBackdropHalo)" />

        {/* Sunbeams during post-practice nourishment */}
        {showSunDew && (
          <g className="transition-opacity duration-700">
            <polygon points="75,0 140,0 205,235 125,235" fill="url(#sunBeamGrad)" />
            <polygon points="165,0 215,0 265,235 205,235" fill="url(#sunBeamGrad)" opacity="0.7" />
          </g>
        )}

        {/* Ground soft shadow */}
        <ellipse cx="160" cy="298" rx="68" ry="11" fill="#4A433D" opacity="0.08" />

        {/* === PLANT LAYER (grows from soil at y=224) === */}
        <g
          filter="url(#softPaperEdge)"
          className={growthPulse ? 'transition-transform duration-1000 ease-in-out scale-[1.05]' : 'animate-gentle-sway'}
          style={{ transformOrigin: '160px 226px' }}
        >
          {isBrandNew ? (
            <FreshSproutArt />
          ) : (
            <StagePlantArt flowerId={flowerId} subStage={subStage} />
          )}
        </g>

        {/* === CERAMIC POT & SOIL === */}
        <g filter="url(#softPaperEdge)">
          {/* Soil mound */}
          <ellipse
            cx="160"
            cy="226"
            rx="56"
            ry="13"
            fill={soilColor}
            className="transition-colors duration-700"
          />
          <path
            d="M114 226 Q160 214 206 226 Q160 236 114 226 Z"
            fill={soilShadow}
            opacity="0.45"
            className="transition-colors duration-700"
          />
          {/* Tiny soil pebbles */}
          <circle cx="136" cy="224" r="2.2" fill="#FAF7F2" opacity="0.35" />
          <circle cx="182" cy="223" r="1.8" fill="#FAF7F2" opacity="0.3" />
          <circle cx="168" cy="227" r="2" fill="#4A433D" opacity="0.2" />

          {/* Pot body */}
          <path
            d="M104 226 L116 286 C118 294 134 298 160 298 C186 298 202 294 204 286 L216 226 Z"
            fill="#EDE3D5"
            stroke="#C7B6A2"
            strokeWidth="1.5"
          />
          {/* Playful picture-book decorative band on pot (echoing striped cuff in reference) */}
          <path
            d="M109 248 L211 248 L208 265 L112 265 Z"
            fill="url(#potStripeBand)"
            opacity="0.82"
          />
          {/* Pot rim */}
          <rect
            x="98"
            y="218"
            width="124"
            height="16"
            rx="8"
            fill="#F4ECE0"
            stroke="#C7B6A2"
            strokeWidth="1.5"
          />
          {/* Subtle hand-drawn highlight on pot */}
          <path
            d="M118 238 L125 282"
            stroke="#FFFDF9"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>

        {/* === MORNING MIST OVERLAY (yesterday missed — gentle & zero-guilt) === */}
        {showMorningMist && (
          <g className="pointer-events-none">
            <g className="animate-mist-drift">
              <ellipse cx="105" cy="186" rx="74" ry="18" fill="#FAF7F2" opacity="0.72" />
              <ellipse cx="218" cy="166" rx="68" ry="15" fill="#FAF7F2" opacity="0.64" />
            </g>
            <g className="animate-mist-drift" style={{ animationDelay: '-3.5s' }}>
              <ellipse cx="164" cy="206" rx="88" ry="16" fill="#FAF7F2" opacity="0.68" />
            </g>
          </g>
        )}

        {/* === GENTLE RAINFALL OVERLAY (rest day exemption) === */}
        {showRain && (
          <g className="pointer-events-none">
            {[
              { x: 88, delay: '0s' },
              { x: 118, delay: '0.35s' },
              { x: 146, delay: '0.15s' },
              { x: 175, delay: '0.55s' },
              { x: 204, delay: '0.25s' },
              { x: 232, delay: '0.7s' },
              { x: 132, delay: '0.9s' },
              { x: 190, delay: '1.1s' },
            ].map((drop, i) => (
              <g
                key={i}
                className="animate-rain-fall"
                style={{ animationDelay: drop.delay }}
              >
                <path
                  d={`M${drop.x} 38 Q${drop.x - 4} 50 ${drop.x - 1} 54 Q${drop.x + 3} 50 ${drop.x} 38 Z`}
                  fill="#8FA998"
                  opacity="0.75"
                />
              </g>
            ))}
          </g>
        )}

        {/* === SUNLIGHT & DEW DROPS OVERLAY (post-practice ritual) === */}
        {showSunDew && (
          <g className="pointer-events-none">
            {[
              { x: 124, delay: '0.05s', color: '#E8C696' },
              { x: 158, delay: '0.28s', color: '#8FA998' },
              { x: 192, delay: '0.18s', color: '#E8C696' },
              { x: 142, delay: '0.55s', color: '#D9A7A7' },
              { x: 176, delay: '0.42s', color: '#8FA998' },
            ].map((d, i) => (
              <g
                key={i}
                className="animate-sun-drop"
                style={{ animationDelay: d.delay }}
              >
                <circle cx={d.x} cy="62" r="4.5" fill={d.color} opacity="0.88" />
                <circle cx={d.x - 1.2} cy="60.5" r="1.4" fill="#FFFDF9" opacity="0.9" />
              </g>
            ))}
          </g>
        )}

        {/* === HAND-DRAWN REST DAY CLOUD STAMP === */}
        {showRestStamp && (
          <g
            transform="translate(238, 66)"
            className="animate-stamp-pop"
            style={{ transformOrigin: '0px 0px' }}
          >
            <circle
              cx="0"
              cy="0"
              r="34"
              fill="#FAF7F2"
              fillOpacity="0.9"
              stroke="#8FA998"
              strokeWidth="1.8"
              strokeDasharray="4 3"
            />
            {/* Cute cloud icon */}
            <path
              d="M-14 4 C-19 4 -21 -3 -16 -6 C-15 -13 -5 -16 1 -10 C5 -13 13 -11 13 -5 C19 -4 20 4 14 4 Z"
              fill="#E3ECE6"
              stroke="#6F8A79"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <text
              x="0"
              y="18"
              textAnchor="middle"
              fill="#5C7666"
              fontSize="8.5"
              fontWeight="600"
              letterSpacing="0.5"
            >
              休息小云朵
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

/** 0-session brand new tiny tender two-leaf sprout */
const FreshSproutArt: React.FC = () => (
  <g>
    {/* Tiny curved stem */}
    <path
      d="M160 226 Q158 202 160 184"
      stroke="#8FA998"
      strokeWidth="4.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Left tender sprout leaf */}
    <path
      d="M159 187 C144 176 132 162 138 154 C146 147 160 163 160 184 Z"
      fill="url(#leafStripesWarm)"
      stroke="#759280"
      strokeWidth="1.2"
    />
    {/* Right tender sprout leaf */}
    <path
      d="M161 187 C176 174 188 164 182 155 C174 148 161 164 160 184 Z"
      fill="#8FA998"
      stroke="#759280"
      strokeWidth="1.2"
    />
    {/* Tiny morning dew glint */}
    <circle cx="173" cy="164" r="2.2" fill="#FFFDF9" opacity="0.85" />
  </g>
);

/** Full 4-species × 4-subStage hand-illustrated botanical renderer */
const StagePlantArt: React.FC<{
  flowerId: FlowerId;
  subStage: GrowthSubStage;
}> = ({ flowerId, subStage }) => {
  const stemHeight =
    subStage === 'seedling'
      ? 68
      : subStage === 'stemming'
        ? 104
        : subStage === 'budding'
          ? 126
          : 138;
  const topY = 224 - stemHeight;

  return (
    <g>
      {/* Secondary decorative side stem for stemming/budding/blooming */}
      {subStage !== 'seedling' && (
        <path
          d={`M159 224 Q142 ${224 - stemHeight * 0.45} 130 ${topY + 34}`}
          stroke="#9BB3A3"
          strokeWidth="3.6"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Main organic stem */}
      <path
        d={
          flowerId === 'lily' && (subStage === 'budding' || subStage === 'blooming')
            ? `M160 225 Q148 156 154 110 Q162 72 198 86`
            : `M160 225 Q154 ${224 - stemHeight * 0.5} 160 ${topY}`
        }
        stroke="#8FA998"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Playful striped picture-book leaves */}
      <g>
        {/* Lower left striped leaf */}
        <path
          d="M158 206 C134 198 112 182 115 168 C132 165 152 180 158 202 Z"
          fill="url(#leafStripesSage)"
        />
        {/* Lower right warm-striped leaf */}
        <path
          d="M161 200 C186 190 206 172 202 158 C185 158 166 176 161 198 Z"
          fill="url(#leafStripesWarm)"
        />
        {subStage !== 'seedling' && (
          <>
            {/* Mid left leaf */}
            <path
              d="M156 174 C132 162 118 140 124 128 C140 132 152 152 157 170 Z"
              fill="#A5B89E"
            />
            <path
              d="M126 132 Q142 150 156 169"
              stroke="#FAF7F2"
              strokeWidth="1.4"
              fill="none"
              opacity="0.7"
            />
            {/* Mid right leaf */}
            <path
              d="M161 164 C186 152 204 134 198 122 C182 126 167 146 161 162 Z"
              fill="url(#leafStripesSage)"
            />
          </>
        )}
      </g>

      {/* Small side bud / curly tendril on secondary stem */}
      {subStage !== 'seedling' && (
        <g transform={`translate(130, ${topY + 32})`}>
          <ellipse cx="0" cy="-6" rx="7" ry="10" fill="#E8C696" opacity="0.88" />
          <path d="M-7 0 Q0 6 7 0 Q0 -4 -7 0 Z" fill="#8FA998" />
        </g>
      )}

      {/* === TOP CROWN: SEEDLING / STEMMING / BUDDING / BLOOMING === */}
      {subStage === 'seedling' && (
        <g transform={`translate(160, ${topY})`}>
          <path
            d="M0 4 C-14 -8 -20 -22 -12 -28 C-2 -26 2 -12 0 4 Z"
            fill="#A5B89E"
          />
          <path
            d="M0 4 C14 -8 20 -22 12 -28 C2 -26 -2 -12 0 4 Z"
            fill="#8FA998"
          />
        </g>
      )}

      {subStage === 'stemming' && (
        <g transform={`translate(160, ${topY})`}>
          {/* Young tightly closed green-apricot bud */}
          <path
            d="M0 -18 C-11 -6 -10 8 0 10 C10 8 11 -6 0 -18 Z"
            fill="#E8C696"
          />
          <path
            d="M-8 6 Q0 -8 8 6 Q0 12 -8 6 Z"
            fill="#8FA998"
          />
        </g>
      )}

      {subStage === 'budding' && (
        <FlowerBudArt
          flowerId={flowerId}
          cx={flowerId === 'lily' ? 196 : 160}
          cy={flowerId === 'lily' ? 88 : topY}
        />
      )}

      {subStage === 'blooming' && (
        <FullBloomArt flowerId={flowerId} cx={160} cy={topY} />
      )}
    </g>
  );
};

const FlowerBudArt: React.FC<{ flowerId: FlowerId; cx: number; cy: number }> = ({
  flowerId,
  cx,
  cy,
}) => {
  const petalTone =
    flowerId === 'tulip'
      ? '#D9A7A7'
      : flowerId === 'chamomile'
        ? '#E8C696'
        : flowerId === 'lily'
          ? '#F2E5DF'
          : '#FFFDF8';

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* Plump peeking bud */}
      <path
        d="M0 -28 C-17 -14 -16 10 0 14 C16 10 17 -14 0 -28 Z"
        fill={petalTone}
        stroke="#D4B89B"
        strokeWidth="1.4"
      />
      {/* Delicate scalloped inner petal peek */}
      <path
        d="M-7 -6 Q0 -18 7 -6"
        stroke="#D9A7A7"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Calyx leaves */}
      <path
        d="M-13 6 Q-4 2 0 14 Q4 2 13 6 Q6 16 0 16 Q-6 16 -13 6 Z"
        fill="#8FA998"
      />
      {/* Playful curly stamens peeking out */}
      <path
        d="M-3 -26 Q-8 -36 -13 -33 M3 -26 Q8 -36 13 -33"
        stroke="#D9A7A7"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="-13" cy="-33" r="2" fill="#E8C696" />
      <circle cx="13" cy="-33" r="2" fill="#E8C696" />
    </g>
  );
};

const FullBloomArt: React.FC<{ flowerId: FlowerId; cx: number; cy: number }> = ({
  flowerId,
  cx,
  cy,
}) => {
  if (flowerId === 'daisy') {
    const petals = Array.from({ length: 14 }, (_, i) => i * (360 / 14));
    return (
      <g transform={`translate(${cx}, ${cy - 6})`}>
        {petals.map((deg, idx) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <ellipse
              cx="0"
              cy="-27"
              rx="8.5"
              ry="20"
              fill={idx % 2 === 0 ? '#FFFDF8' : '#F6ECDC'}
              stroke="#E2C7A2"
              strokeWidth="1.2"
            />
          </g>
        ))}
        {/* Picture-book dotted golden-apricot core */}
        <circle cx="0" cy="0" r="17" fill="#E8C696" />
        <circle cx="0" cy="0" r="12" fill="#F2D7AD" />
        {[
          [-5, -4],
          [5, -4],
          [0, 1],
          [-6, 5],
          [6, 5],
          [0, -7],
          [0, 7],
        ].map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r="1.8" fill="#B5834B" opacity="0.8" />
        ))}
      </g>
    );
  }

  if (flowerId === 'chamomile') {
    // Cheerful cluster of 3 picture-book chamomile blossoms
    const blossoms = [
      { x: 0, y: -12, s: 1.05 },
      { x: -34, y: 8, s: 0.72 },
      { x: 34, y: 12, s: 0.68 },
    ];
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <path d="M0 18 Q-18 14 -34 8" stroke="#8FA998" strokeWidth="3.2" fill="none" />
        <path d="M0 20 Q20 18 34 12" stroke="#8FA998" strokeWidth="3.2" fill="none" />
        {blossoms.map((b, bi) => (
          <g key={bi} transform={`translate(${b.x}, ${b.y}) scale(${b.s})`}>
            {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => (
              <ellipse
                key={deg}
                transform={`rotate(${deg})`}
                cx="0"
                cy="-22"
                rx="6.8"
                ry="15"
                fill="#FFFDF8"
                stroke="#E8C696"
                strokeWidth="1.1"
              />
            ))}
            {/* Plump warm chamomile dome */}
            <circle cx="0" cy="0" r="15" fill="#E8C696" />
            <circle cx="0" cy="-2" r="11" fill="#DFAF6E" opacity="0.7" />
            {[-5, 0, 5, -3, 3].map((dx, i) => (
              <circle
                key={i}
                cx={dx}
                cy={i < 3 ? -3 : 4}
                r="1.7"
                fill="#FAF7F2"
                opacity="0.85"
              />
            ))}
          </g>
        ))}
      </g>
    );
  }

  if (flowerId === 'tulip') {
    return (
      <g transform={`translate(${cx}, ${cy - 8})`}>
        {/* Curly playful stamens */}
        <path
          d="M-6 -30 Q-14 -48 -22 -42 M6 -30 Q14 -48 22 -42"
          stroke="#C88D8D"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="-22" cy="-42" r="3" fill="#E8C696" />
        <circle cx="22" cy="-42" r="3" fill="#E8C696" />

        {/* Back warm apricot petals */}
        <ellipse cx="-16" cy="-12" rx="18" ry="30" transform="rotate(-14 -16 -12)" fill="#E8C696" />
        <ellipse cx="16" cy="-12" rx="18" ry="30" transform="rotate(14 16 -12)" fill="#E8C696" />

        {/* Main scalloped dusty-rose tulip cup */}
        <path
          d="M-32 -24 C-32 16 -16 26 0 26 C16 26 32 16 32 -24 C20 -10 10 -12 0 -32 C-10 -12 -20 -10 -32 -24 Z"
          fill="#D9A7A7"
          stroke="#C48F8F"
          strokeWidth="1.4"
        />
        {/* Decorative picture-book inner petal stripes */}
        <path
          d="M-16 -6 Q-12 10 -6 20 M0 -16 L0 21 M16 -6 Q12 10 6 20"
          stroke="#FAF7F2"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.7"
          fill="none"
        />
        {/* Calyx base */}
        <path d="M-14 22 Q0 32 14 22 Q6 20 0 25 Q-6 20 -14 22 Z" fill="#8FA998" />
      </g>
    );
  }

  // Lily of the Valley — graceful arching stem with drooping scalloped bells (homage to reference image left bell flower)
  return (
    <g>
      {[
        { x: 152, y: 112, s: 0.95 },
        { x: 174, y: 92, s: 1.0 },
        { x: 198, y: 94, s: 0.88 },
      ].map((bell, idx) => (
        <g key={idx} transform={`translate(${bell.x}, ${bell.y}) scale(${bell.s})`}>
          {/* Little hanging stem */}
          <path d="M0 -14 L0 -6" stroke="#8FA998" strokeWidth="2.2" />
          {/* Bell crown cap */}
          <ellipse cx="0" cy="-7" rx="6" ry="3.5" fill="#8FA998" />
          {/* Scalloped drooping bell */}
          <path
            d="M-14 12 C-14 -4 -8 -8 0 -8 C8 -8 14 -4 14 12 Q7 6 0 13 Q-7 6 -14 12 Z"
            fill={idx === 1 ? '#F7EAE4' : '#FFFDF8'}
            stroke="#D9A7A7"
            strokeWidth="1.4"
          />
          {/* Wavy inner line */}
          <path
            d="M-10 5 Q-5 2 0 5 Q5 2 10 5"
            stroke="#D9A7A7"
            strokeWidth="1.2"
            fill="none"
            opacity="0.75"
          />
          {/* Dangling golden stamens */}
          <path d="M-3 11 L-4 17 M3 11 L4 17" stroke="#C89E63" strokeWidth="1.3" />
          <circle cx="-4" cy="18" r="2" fill="#E8C696" />
          <circle cx="4" cy="18" r="2" fill="#E8C696" />
        </g>
      ))}
    </g>
  );
};

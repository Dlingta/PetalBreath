import { FlowerId } from '../types/app';

export interface RenderShareCardOptions {
  flowerId: FlowerId;
  flowerName: string;
  quote: string;
  dateLabel: string;
  minutes: number;
  isRestDay?: boolean;
  weeksLabel?: string;
  flowerLanguage?: string;
}

/**
 * Generates a high-resolution (900x1200) de-medicalized watercolor botanical card
 * on an offscreen canvas and triggers PNG download.
 */
export function downloadShareCardPng(opts: RenderShareCardOptions): void {
  const width = 900;
  const height = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Warm rice-paper background
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, width, height);

  // Soft watercolor washes
  const wash1 = ctx.createRadialGradient(220, 260, 40, 220, 260, 420);
  wash1.addColorStop(0, 'rgba(232, 198, 150, 0.24)');
  wash1.addColorStop(1, 'rgba(232, 198, 150, 0)');
  ctx.fillStyle = wash1;
  ctx.fillRect(0, 0, width, height);

  const wash2 = ctx.createRadialGradient(700, 440, 30, 700, 440, 380);
  wash2.addColorStop(0, 'rgba(217, 167, 167, 0.20)');
  wash2.addColorStop(1, 'rgba(217, 167, 167, 0)');
  ctx.fillStyle = wash2;
  ctx.fillRect(0, 0, width, height);

  const wash3 = ctx.createRadialGradient(450, 960, 40, 450, 960, 440);
  wash3.addColorStop(0, 'rgba(143, 169, 152, 0.20)');
  wash3.addColorStop(1, 'rgba(143, 169, 152, 0)');
  ctx.fillStyle = wash3;
  ctx.fillRect(0, 0, width, height);

  // Subtle cotton paper speckles
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const alpha = Math.random() * 0.03;
    ctx.fillStyle = `rgba(74, 67, 61, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Delicate archival inner frame
  ctx.strokeStyle = 'rgba(74, 67, 61, 0.11)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 48, 48, width - 96, height - 96, 36);
  ctx.stroke();

  // Top editorial metadata (date & brand mark)
  ctx.fillStyle = '#8C8177';
  ctx.font = '500 24px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(opts.dateLabel, 96, 122);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#8FA998';
  ctx.font = '500 24px "Fraunces", "Noto Serif SC", serif';
  ctx.fillText('花息 · PetalBreath', width - 96, 122);

  // Center illustration medallion backdrop
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, 470, 220, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 253, 249, 0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(143, 169, 152, 0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Draw bespoke botanical artwork
  if (opts.isRestDay) {
    drawCloudIllustration(ctx, width / 2, 465);
  } else {
    drawFlowerIllustration(ctx, opts.flowerId, width / 2, 480);
  }

  // Tape accents at top & bottom of specimen area
  ctx.save();
  ctx.translate(width / 2 - 140, 278);
  ctx.rotate(-0.18);
  ctx.fillStyle = 'rgba(232, 198, 150, 0.45)';
  ctx.fillRect(-52, -16, 104, 32);
  ctx.restore();

  ctx.save();
  ctx.translate(width / 2 + 145, 650);
  ctx.rotate(0.14);
  ctx.fillStyle = 'rgba(143, 169, 152, 0.35)';
  ctx.fillRect(-48, -15, 96, 30);
  ctx.restore();

  // Main poetic coded quote (strictly de-medicalized)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4A433D';
  ctx.font = '500 40px "Noto Serif SC", "Fraunces", Georgia, serif';

  const durationSuffix = opts.isRestDay
    ? ' · 蓄力休息日'
    : opts.minutes > 0
      ? ` · ${opts.minutes} min`
      : '';
  const mainLine = `${opts.quote}${durationSuffix}`;
  wrapCenteredText(ctx, mainLine, width / 2, 792, 680, 58);

  // Secondary quiet caption (specimen name / flower language)
  ctx.fillStyle = '#7A7067';
  ctx.font = '400 25px "Noto Sans SC", "Plus Jakarta Sans", sans-serif';
  const subText = opts.flowerLanguage
    ? `${opts.flowerName} · ${opts.flowerLanguage}`
    : opts.isRestDay
      ? '今天好好休息，也是在蓄力呀'
      : `${opts.flowerName}花期 · 静静滋养，不慌不忙`;
  wrapCenteredText(ctx, subText, width / 2, 932, 660, 40);

  // Subtle horizontal divider
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, 1048);
  ctx.lineTo(width / 2 + 80, 1048);
  ctx.strokeStyle = 'rgba(74, 67, 61, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Footer poetic whisper
  ctx.fillStyle = '#9C9288';
  ctx.font = '400 21px "Noto Sans SC", sans-serif';
  ctx.fillText(
    opts.weeksLabel
      ? `陪伴记录 · ${opts.weeksLabel} · 温柔花期手账`
      : '一呼一吸 · 与自己温柔相伴',
    width / 2,
    1096
  );

  // Trigger download
  const link = document.createElement('a');
  link.download = `petalbreath-card-${opts.dateLabel.replace(/[^0-9]/g, '')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const chars = Array.from(text);
  let line = '';
  let currY = y;
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currY);
      line = chars[i];
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currY);
  }
}

function drawCloudIllustration(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.fillStyle = '#E8EFEA';
  ctx.strokeStyle = '#8FA998';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.arc(cx - 56, cy + 10, 44, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(cx - 12, cy - 26, 54, Math.PI * 1.0, Math.PI * 1.9);
  ctx.arc(cx + 50, cy - 4, 46, Math.PI * 1.25, Math.PI * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gentle raindrops
  ctx.fillStyle = '#8FA998';
  const drops = [
    [-55, 86],
    [-15, 102],
    [25, 84],
    [60, 98],
  ];
  drops.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + dy, 6, 13, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawFlowerIllustration(
  ctx: CanvasRenderingContext2D,
  flowerId: FlowerId,
  cx: number,
  cy: number
) {
  ctx.save();

  // Curved organic stem
  ctx.strokeStyle = '#8FA998';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 160);
  ctx.quadraticCurveTo(cx - 18, cy + 70, cx, cy - 15);
  ctx.stroke();

  // Two picture-book striped leaves
  const drawLeaf = (lx: number, ly: number, rot: number, flip: number) => {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    ctx.scale(flip, 1);
    ctx.fillStyle = '#8FA998';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(44, -36, 92, -10);
    ctx.quadraticCurveTo(50, 26, 0, 0);
    ctx.fill();

    // Diagonal hand-drawn stripes inspired by reference illustration
    ctx.strokeStyle = '#FAF7F2';
    ctx.lineWidth = 2.5;
    for (let s = 18; s < 78; s += 16) {
      ctx.beginPath();
      ctx.moveTo(s, -14);
      ctx.lineTo(s - 8, 8);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawLeaf(cx - 10, cy + 100, -0.35, -1);
  drawLeaf(cx - 6, cy + 82, 0.28, 1);

  if (flowerId === 'daisy' || flowerId === 'chamomile') {
    const petalCount = flowerId === 'daisy' ? 14 : 12;
    const petalLen = flowerId === 'daisy' ? 92 : 84;
    for (let i = 0; i < petalCount; i++) {
      ctx.save();
      ctx.translate(cx, cy - 34);
      ctx.rotate((i / petalCount) * Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#FFFDF8' : '#F6ECDC';
      ctx.strokeStyle = '#E8C696';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -petalLen * 0.58, 18, petalLen * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    // Warm apricot dotted center
    ctx.beginPath();
    ctx.arc(cx, cy - 34, flowerId === 'chamomile' ? 42 : 34, 0, Math.PI * 2);
    ctx.fillStyle = '#E8C696';
    ctx.fill();
    ctx.fillStyle = '#B8894F';
    for (let d = 0; d < 12; d++) {
      const ang = (d / 12) * Math.PI * 2;
      const rad = d % 2 === 0 ? 18 : 10;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * rad, cy - 34 + Math.sin(ang) * rad, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (flowerId === 'tulip') {
    // Scalloped layered rose-apricot tulip
    ctx.save();
    ctx.translate(cx, cy - 38);
    // Back petals
    ctx.fillStyle = '#E8C696';
    ctx.beginPath();
    ctx.ellipse(-28, -22, 34, 68, -0.25, 0, Math.PI * 2);
    ctx.ellipse(28, -22, 34, 68, 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Front cup
    ctx.fillStyle = '#D9A7A7';
    ctx.beginPath();
    ctx.moveTo(-62, -46);
    ctx.quadraticCurveTo(-58, 46, 0, 52);
    ctx.quadraticCurveTo(58, 46, 62, -46);
    ctx.quadraticCurveTo(30, -18, 0, -56);
    ctx.quadraticCurveTo(-30, -18, -62, -46);
    ctx.closePath();
    ctx.fill();
    // Delicate inner veins
    ctx.strokeStyle = 'rgba(255, 253, 248, 0.65)';
    ctx.lineWidth = 3;
    [-26, 0, 26].forEach((vx) => {
      ctx.beginPath();
      ctx.moveTo(vx * 0.5, 36);
      ctx.quadraticCurveTo(vx, 0, vx * 1.1, -24);
      ctx.stroke();
    });
    ctx.restore();
  } else {
    // Lily of the Valley arching bells
    ctx.strokeStyle = '#8FA998';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 15);
    ctx.quadraticCurveTo(cx - 24, cy - 110, cx + 68, cy - 95);
    ctx.stroke();

    const bells = [
      { x: cx - 12, y: cy - 58, s: 1 },
      { x: cx + 26, y: cy - 86, s: 0.92 },
      { x: cx + 66, y: cy - 72, s: 0.84 },
    ];
    bells.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.s, b.s);
      ctx.fillStyle = '#F7ECE6';
      ctx.strokeStyle = '#D9A7A7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-26, 20);
      ctx.quadraticCurveTo(-28, -24, 0, -26);
      ctx.quadraticCurveTo(28, -24, 26, 20);
      ctx.quadraticCurveTo(13, 10, 0, 22);
      ctx.quadraticCurveTo(-13, 10, -26, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Hanging golden stamens
      ctx.fillStyle = '#E8C696';
      ctx.beginPath();
      ctx.arc(-6, 29, 4.5, 0, Math.PI * 2);
      ctx.arc(6, 31, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  ctx.restore();
}

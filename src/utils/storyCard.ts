import { BirthdayGiftData } from '../types/birthday';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRectPath(
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  focusY = 0.25
) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) * focusY;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4
): number {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineHeight);
  });

  return startY + lines.length * lineHeight;
}

export async function generateAndShareStoryCard(data: BirthdayGiftData): Promise<'shared' | 'downloaded'> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const width = 1080;
  const height = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  // 1. Base Background + Backdrop Photo
  ctx.fillStyle = '#141110';
  ctx.fillRect(0, 0, width, height);

  const bgImg = await loadImage(data.heroBgImageUrl);
  if (bgImg) {
    ctx.save();
    ctx.globalAlpha = 0.42;
    drawCoverImage(ctx, bgImg, 0, 0, width, height, 0.5);
    ctx.restore();
  }

  // Warm atmospheric vertical gradient veil
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(20, 17, 16, 0.72)');
  grad.addColorStop(0.45, 'rgba(20, 17, 16, 0.55)');
  grad.addColorStop(1, 'rgba(17, 14, 13, 0.94)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle inner gold border frame
  ctx.strokeStyle = 'rgba(245, 196, 81, 0.35)';
  ctx.lineWidth = 2;
  drawRoundedRectPath(ctx, 48, 48, width - 96, height - 96, 36);
  ctx.stroke();

  // 2. Top Kicker
  ctx.fillStyle = '#F5C451';
  ctx.textAlign = 'center';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('26 NOVEMBER · BIRTHDAY EDITION', width / 2, 145);

  // 3. Framed Portrait Card
  const frameW = 780;
  const frameH = 880;
  const frameX = (width - frameW) / 2;
  const frameY = 205;

  const portraitImg = await loadImage(data.heroImageUrl);
  ctx.save();
  drawRoundedRectPath(ctx, frameX, frameY, frameW, frameH, 32);
  ctx.clip();

  if (portraitImg) {
    drawCoverImage(ctx, portraitImg, frameX, frameY, frameW, frameH, 0.22);
  } else {
    ctx.fillStyle = '#2A2321';
    ctx.fillRect(frameX, frameY, frameW, frameH);
  }

  // Bottom vignette inside portrait
  const imgGrad = ctx.createLinearGradient(0, frameY + frameH - 220, 0, frameY + frameH);
  imgGrad.addColorStop(0, 'rgba(0,0,0,0)');
  imgGrad.addColorStop(1, 'rgba(17,14,13,0.75)');
  ctx.fillStyle = imgGrad;
  ctx.fillRect(frameX, frameY, frameW, frameH);
  ctx.restore();

  // Portrait hairline gold frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 2;
  drawRoundedRectPath(ctx, frameX, frameY, frameW, frameH, 32);
  ctx.stroke();

  // 4. Headline
  ctx.fillStyle = '#FAF7F2';
  ctx.textAlign = 'center';
  ctx.font = '600 72px "Fraunces", Georgia, serif';
  ctx.fillText('Happy Birthday,', width / 2, 1195);

  ctx.fillStyle = '#F5C451';
  ctx.font = 'italic 600 74px "Fraunces", Georgia, serif';
  ctx.fillText(data.friendName, width / 2, 1285);

  // 5. Opening Quote
  ctx.fillStyle = 'rgba(250, 247, 242, 0.86)';
  ctx.font = 'italic 400 34px "Fraunces", Georgia, serif';
  const noteText = `“${data.openingNote || data.heroSubtitle}”`;
  wrapText(ctx, noteText, width / 2, 1390, 820, 52, 5);

  // 6. Bottom Signature
  ctx.fillStyle = 'rgba(250, 247, 242, 0.55)';
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`With love from ${data.senderName}`, width / 2, 1805);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) throw new Error('Could not generate story image');

  const fileName = `${(data.shortName || 'mim').toLowerCase()}-birthday-story.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  // Use native mobile share sheet if available (lets Mim post directly to Story)
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: `Happy Birthday, ${data.friendName}`,
      });
      return 'shared';
    } catch {
      // User cancelled share sheet or desktop fallback -> trigger clean download
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { LockOpen, Mail, Sparkles, Star } from 'lucide-react';
import { ACCENT_THEMES, BirthdayGiftData, StarWish } from '../types/birthday';

interface LetterAndSkyProps {
  data: BirthdayGiftData;
}

interface BgStar {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  phase: number;
}

interface Point {
  x: number;
  y: number;
}

const MIM_CONSTELLATION_STROKES: Point[][] = [
  // Letter M (left)
  [
    { x: 0.16, y: 0.64 },
    { x: 0.16, y: 0.34 },
    { x: 0.25, y: 0.5 },
    { x: 0.34, y: 0.34 },
    { x: 0.34, y: 0.64 },
  ],
  // Letter I (center)
  [
    { x: 0.47, y: 0.34 },
    { x: 0.53, y: 0.34 },
  ],
  [
    { x: 0.5, y: 0.34 },
    { x: 0.5, y: 0.64 },
  ],
  [
    { x: 0.47, y: 0.64 },
    { x: 0.53, y: 0.64 },
  ],
  // Letter M (right)
  [
    { x: 0.66, y: 0.64 },
    { x: 0.66, y: 0.34 },
    { x: 0.75, y: 0.5 },
    { x: 0.84, y: 0.34 },
    { x: 0.84, y: 0.64 },
  ],
];

const WISH_STAR_COORDS: Point[] = [
  { x: 0.22, y: 0.2 },
  { x: 0.5, y: 0.78 },
  { x: 0.78, y: 0.2 },
];

function createSeededStars(seedStr: string, count: number): BgStar[] {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  return Array.from({ length: count }, () => ({
    x: 0.04 + nextRand() * 0.92,
    y: 0.06 + nextRand() * 0.88,
    radius: 0.65 + nextRand() * 1.4,
    baseAlpha: 0.25 + nextRand() * 0.65,
    phase: nextRand() * Math.PI * 2,
  }));
}

export function LetterAndSky({ data }: LetterAndSkyProps) {
  const [postscriptOpen, setPostscriptOpen] = useState(false);
  const [traced, setTraced] = useState(false);
  const [selectedStarId, setSelectedStarId] = useState<string>(data.starWishes[0]?.id ?? '');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const traceProgressRef = useRef<number>(0);

  const theme = ACCENT_THEMES[data.accentTheme];
  const paragraphs = data.letterBody.split(/\n+/).filter((p) => p.trim().length > 0);
  const bgStars = useMemo(() => createSeededStars(data.birthdayDate || '2026-11-26', 85), [data.birthdayDate]);

  const activeWish: StarWish | null =
    data.starWishes.find((w) => w.id === selectedStarId) || data.starWishes[0] || null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (timeMs: number) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const t = prefersReduced ? 0 : timeMs * 0.0014;

      ctx.clearRect(0, 0, width, height);

      if (traced && traceProgressRef.current < 1) {
        traceProgressRef.current = Math.min(1, traceProgressRef.current + (prefersReduced ? 1 : 0.03));
      } else if (!traced && traceProgressRef.current > 0) {
        traceProgressRef.current = Math.max(0, traceProgressRef.current - (prefersReduced ? 1 : 0.04));
      }

      bgStars.forEach((star) => {
        const sx = star.x * width;
        const sy = star.y * height;
        const twinkle = prefersReduced ? 1 : 0.72 + 0.28 * Math.sin(t * 1.4 + star.phase);
        ctx.fillStyle = `rgba(250, 247, 242, ${(star.baseAlpha * twinkle).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fill();

        if (pointerRef.current) {
          const dx = sx - pointerRef.current.x;
          const dy = sy - pointerRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 90) {
            ctx.strokeStyle = `rgba(245, 196, 81, ${((1 - dist / 90) * 0.28).toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(pointerRef.current.x, pointerRef.current.y);
            ctx.stroke();
          }
        }
      });

      const progress = traceProgressRef.current;
      if (progress > 0.01) {
        ctx.save();
        ctx.strokeStyle = `rgba(245, 196, 81, ${(0.82 * progress).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = 'rgba(245, 196, 81, 0.5)';
        ctx.shadowBlur = 10;

        MIM_CONSTELLATION_STROKES.forEach((stroke) => {
          const totalSegments = stroke.length - 1;
          const drawUnits = totalSegments * progress;
          ctx.beginPath();
          ctx.moveTo(stroke[0].x * width, stroke[0].y * height);

          for (let i = 0; i < totalSegments; i++) {
            const segProgress = Math.max(0, Math.min(1, drawUnits - i));
            if (segProgress <= 0) break;
            const p0 = stroke[i];
            const p1 = stroke[i + 1];
            ctx.lineTo(
              (p0.x + (p1.x - p0.x) * segProgress) * width,
              (p0.y + (p1.y - p0.y) * segProgress) * height
            );
          }
          ctx.stroke();

          stroke.forEach((pt, idx) => {
            if (idx / Math.max(1, totalSegments) <= progress + 0.05) {
              ctx.fillStyle = '#FEF3C7';
              ctx.beginPath();
              ctx.arc(pt.x * width, pt.y * height, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        });
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [bgStars, traced]);

  return (
    <section id="keepsake" className="py-14 md:py-20 bg-white border-t border-[#EAE4DC]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Intimate Birthday Letter */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B645C] mb-2.5">
                Personal Note · For {data.friendName}
              </p>
              <h2
                className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#161412] leading-[1.2] mb-6"
                style={{ textWrap: 'balance' }}
              >
                {data.letterHeading}
              </h2>

              <div className="space-y-4 text-[15px] text-[#45403A] leading-[1.75] max-w-[54ch]">
                {paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#EAE4DC]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#6B645C]">Always yours,</p>
                  <p className="font-serif italic text-lg font-medium text-[#161412] mt-0.5">
                    {data.senderName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPostscriptOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    postscriptOpen
                      ? 'bg-[#F2ECE3] text-[#161412] hover:bg-[#EAE4DC]'
                      : `${theme.primaryBg} ${theme.primaryHover} text-white ${theme.accentRing}`
                  }`}
                >
                  {postscriptOpen ? (
                    <>
                      <LockOpen className="w-3.5 h-3.5" />
                      <span>Hide Postscript</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open Postscript</span>
                    </>
                  )}
                </button>
              </div>

              {postscriptOpen && (
                <div className="mt-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]">
                  <p className="font-serif italic text-base text-[#161412] leading-relaxed">
                    “{data.letterPostscript}”
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Compact Jewel-Like 26 Nov Night Sky Constellation */}
          <div className="lg:col-span-6 flex flex-col rounded-2xl overflow-hidden border border-[#24262E] bg-[#0D0F16] text-white">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-white/60">26 November Night Sky</p>
                <h3 className="font-serif text-lg font-semibold text-white">
                  Stars Aligned for {data.shortName || data.friendName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setTraced((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${theme.primaryBg} ${theme.primaryHover}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{traced ? 'Hide Name' : `Trace ${data.shortName || 'Mim'}`}</span>
              </button>
            </div>

            <div
              className="relative flex-1 min-h-[260px] select-none"
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                pointerRef.current = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                };
              }}
              onPointerLeave={() => {
                pointerRef.current = null;
              }}
            >
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

              {data.starWishes.slice(0, 3).map((wish, idx) => {
                const pos = WISH_STAR_COORDS[idx] || { x: 0.25 + idx * 0.25, y: 0.5 };
                const isSelected = activeWish?.id === wish.id;
                return (
                  <button
                    key={wish.id}
                    type="button"
                    onClick={() => setSelectedStarId(wish.id)}
                    style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C451] rounded-lg"
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                        isSelected
                          ? 'bg-[#F5C451] text-[#141311] shadow-[0_0_16px_rgba(245,196,81,0.75)]'
                          : 'bg-white/15 text-[#F5C451] border border-white/25'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </span>
                    <span
                      className={`text-[11px] font-medium whitespace-nowrap ${
                        isSelected ? 'text-[#F5C451]' : 'text-white/75 group-hover:text-white'
                      }`}
                    >
                      {wish.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeWish && (
              <div className="px-6 py-4 border-t border-white/10 bg-[#12151F]">
                <p className="text-[11px] text-[#F5C451] mb-1">
                  Star Wish · {activeWish.label}
                </p>
                <p className="font-serif italic text-sm md:text-base text-white/95 leading-relaxed">
                  “{activeWish.message}”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

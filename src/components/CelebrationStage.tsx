import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Gift, Music, Pause, RotateCcw, Sparkles, Wind } from 'lucide-react';
import { ACCENT_THEMES, BirthdayGiftData } from '../types/birthday';
import { playCelebrationChime } from '../utils/audio';
import { generateAndShareStoryCard } from '../utils/storyCard';
import { SafeImage } from './SafeImage';
import { ScratchRevealCard } from './ScratchRevealCard';

interface CelebrationStageProps {
  data: BirthdayGiftData;
  isPlayingMusic: boolean;
  onStartMusic: () => void;
  onStopMusic: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  isRibbon?: boolean;
  rotation: number;
  vRot: number;
}

const CELEBRATION_COLORS = ['#F5C451', '#E88D67', '#FAF7F2', '#E15A64', '#C084FC'];

export function CelebrationStage({
  data,
  isPlayingMusic,
  onStartMusic,
  onStopMusic,
}: CelebrationStageProps) {
  const candleCount = Math.max(1, Math.min(7, data.candleCount || 5));
  const [litCandles, setLitCandles] = useState<boolean[]>(() =>
    Array.from({ length: candleCount }, () => true)
  );
  const [showSmoke, setShowSmoke] = useState<boolean[]>(() =>
    Array.from({ length: candleCount }, () => false)
  );
  const [wishGranted, setWishGranted] = useState(false);
  const [pickedTreatId, setPickedTreatId] = useState<string | null>(null);
  const [storyFeedback, setStoryFeedback] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const theme = ACCENT_THEMES[data.accentTheme];

  useEffect(() => {
    setLitCandles(Array.from({ length: candleCount }, () => true));
    setShowSmoke(Array.from({ length: candleCount }, () => false));
    setWishGranted(false);
    setPickedTreatId(null);
  }, [candleCount]);

  const launchCelebrationBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const width = canvas.width;
    const height = canvas.height;
    const newParticles: Particle[] = [];

    const burstCenters = [
      { x: width * 0.25, y: height * 0.28 },
      { x: width * 0.5, y: height * 0.2 },
      { x: width * 0.75, y: height * 0.3 },
    ];

    burstCenters.forEach((center) => {
      for (let i = 0; i < 42; i++) {
        const angle = (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.2;
        const speed = 2.2 + Math.random() * 4.5;
        newParticles.push({
          x: center.x,
          y: center.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.2 + Math.random() * 2.5,
          color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
          alpha: 1,
          decay: 0.011 + Math.random() * 0.008,
          gravity: 0.055,
          rotation: 0,
          vRot: 0,
        });
      }
    });

    for (let i = 0; i < 65; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: -10 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 2.2,
        vy: 1.8 + Math.random() * 2.6,
        size: 6 + Math.random() * 5,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        alpha: 0.95,
        decay: 0.0045 + Math.random() * 0.003,
        gravity: 0.02,
        isRibbon: true,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.14,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.alpha <= 0.02 || p.y > canvas.height + 30) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        if (p.isRibbon) {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.45);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const triggerWishGranted = useCallback(() => {
    setWishGranted(true);
    playCelebrationChime();
    launchCelebrationBurst();
    window.setTimeout(() => launchCelebrationBurst(), 650);
    if (!isPlayingMusic) {
      onStartMusic();
    }
  }, [isPlayingMusic, launchCelebrationBurst, onStartMusic]);

  const blowOutAllCandles = useCallback(() => {
    setLitCandles((prev) => {
      if (prev.every((v) => !v)) return prev;
      return prev.map(() => false);
    });
    setShowSmoke(Array.from({ length: candleCount }, () => true));
    triggerWishGranted();
  }, [candleCount, triggerWishGranted]);

  const toggleSingleCandle = (idx: number) => {
    setLitCandles((prev) => {
      if (!prev[idx]) return prev;
      const next = [...prev];
      next[idx] = false;
      setShowSmoke((s) => {
        const nextSmoke = [...s];
        nextSmoke[idx] = true;
        return nextSmoke;
      });
      if (next.every((v) => !v)) {
        window.setTimeout(() => triggerWishGranted(), 120);
      }
      return next;
    });
  };

  const relightCandles = () => {
    setLitCandles(Array.from({ length: candleCount }, () => true));
    setShowSmoke(Array.from({ length: candleCount }, () => false));
    setWishGranted(false);
    setPickedTreatId(null);
  };

  const handlePickTreat = (id: string) => {
    setPickedTreatId(id);
    playCelebrationChime();
    launchCelebrationBurst();
  };

  const anyLit = litCandles.some(Boolean);

  const candlePositions = Array.from({ length: candleCount }, (_, i) => {
    if (candleCount === 1) return 160;
    const span = Math.min(148, candleCount * 26);
    const start = 160 - span / 2;
    return start + (span / (candleCount - 1)) * i;
  });

  return (
    <section
      id="make-a-wish"
      className="relative bg-[#11100F] text-[#FAF7F2] py-16 md:py-22 overflow-hidden"
    >
      {/* Atmospheric Soft Portrait Backdrop */}
      {data.finaleBgImageUrl && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SafeImage
            src={data.finaleBgImageUrl}
            alt=""
            className="w-full h-full object-cover object-[50%_20%] opacity-[0.15] blur-[2px] scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#11100F] via-[#11100F]/80 to-[#11100F]" />
        </div>
      )}

      {/* Fireworks & Confetti Canvas Layer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      <div className="relative z-20 max-w-[920px] mx-auto px-6 text-center">
        <p className="text-xs font-medium text-white/65 mb-2.5 tracking-wide">
          Candlelight Finale
        </p>

        <h2
          className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3"
          style={{ textWrap: 'balance' }}
        >
          {wishGranted
            ? `Happy Birthday, ${data.shortName || data.friendName}!`
            : `Make a wish, ${data.shortName || data.friendName}.`}
        </h2>

        <p className="text-sm md:text-base text-white/75 max-w-lg mx-auto mb-8 leading-relaxed">
          {wishGranted
            ? 'Scratch the golden foil card below, then pick one bonus birthday treat.'
            : 'Tap any flame on the cake or press Blow Out Candles to unlock your surprise.'}
        </p>

        {/* Interactive Celebration Cake SVG */}
        <div className="relative mx-auto w-full max-w-[320px] flex flex-col items-center mb-8">
          {anyLit && (
            <div
              aria-hidden="true"
              className="absolute -top-6 w-64 h-40 rounded-full bg-[#F59E0B]/20 blur-3xl pointer-events-none"
            />
          )}

          <svg
            viewBox="0 0 320 250"
            className="w-full h-auto drop-shadow-2xl select-none"
            role="group"
            aria-label="Interactive Birthday Cake with Candles"
          >
            <ellipse cx="160" cy="226" rx="118" ry="12" fill="#2A2623" />
            <rect x="144" y="204" width="32" height="22" rx="4" fill="#3A342F" />
            <ellipse cx="160" cy="204" rx="130" ry="14" fill="#3D3732" />

            <rect x="64" y="138" width="192" height="62" rx="12" fill="#F2E6D8" />
            <path
              d="M64 150 Q80 166 96 150 Q112 166 128 150 Q144 166 160 150 Q176 166 192 150 Q208 166 224 150 Q240 166 256 150 L256 138 Q256 130 244 130 L76 130 Q64 130 64 138 Z"
              fill="#FFF9F2"
            />

            <rect x="92" y="92" width="136" height="46" rx="10" fill="#EAD6C0" />
            <path
              d="M92 104 Q106 118 120 104 Q134 118 148 104 Q162 118 176 104 Q190 118 204 104 Q216 118 228 104 L228 94 Q228 86 218 86 L102 86 Q92 86 92 94 Z"
              fill="#FFFDF9"
            />

            <circle cx="110" cy="134" r="4.5" fill="#8E2443" />
            <circle cx="160" cy="135" r="4.5" fill="#8E2443" />
            <circle cx="210" cy="134" r="4.5" fill="#8E2443" />
            <circle cx="135" cy="134" r="3" fill="#C88A2B" />
            <circle cx="185" cy="134" r="3" fill="#C88A2B" />

            {candlePositions.map((cx, idx) => {
              const isLit = litCandles[idx];
              const smoking = showSmoke[idx];
              return (
                <g
                  key={idx}
                  onClick={() => toggleSingleCandle(idx)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={isLit ? `Blow out candle ${idx + 1}` : `Candle ${idx + 1} blown out`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSingleCandle(idx);
                    }
                  }}
                >
                  <rect
                    x={cx - 4.5}
                    y="48"
                    width="9"
                    height="40"
                    rx="2.5"
                    fill={idx % 2 === 0 ? '#E8B86D' : '#F4DFC8'}
                  />
                  <line
                    x1={cx - 4}
                    y1="62"
                    x2={cx + 4}
                    y2="56"
                    stroke="#C88A2B"
                    strokeWidth="1.5"
                    opacity="0.65"
                  />
                  <line x1={cx} y1="48" x2={cx} y2="42" stroke="#2B2623" strokeWidth="1.5" />

                  {isLit && (
                    <g className="animate-flame" style={{ transformOrigin: `${cx}px 42px` }}>
                      <circle cx={cx} cy="32" r="14" fill="#F59E0B" opacity="0.22" />
                      <path
                        d={`M ${cx} 17 C ${cx + 7} 26, ${cx + 6} 39, ${cx} 42 C ${cx - 6} 39, ${cx - 7} 26, ${cx} 17 Z`}
                        fill="#F59E0B"
                      />
                      <path
                        d={`M ${cx} 24 C ${cx + 3.5} 30, ${cx + 3} 38, ${cx} 40 C ${cx - 3} 38, ${cx - 3.5} 30, ${cx} 24 Z`}
                        fill="#FEF3C7"
                      />
                    </g>
                  )}

                  {!isLit && smoking && (
                    <g className="animate-smoke">
                      <circle cx={cx} cy="36" r="3" fill="#D6D3CD" opacity="0.55" />
                      <circle cx={cx + 3} cy="29" r="4" fill="#D6D3CD" opacity="0.35" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          {anyLit ? (
            <button
              type="button"
              onClick={blowOutAllCandles}
              className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#11100F] ${theme.primaryBg} ${theme.primaryHover} ${theme.accentRing}`}
            >
              <Wind className="w-4 h-4" />
              <span>Blow Out Candles</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={launchCelebrationBurst}
                className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#11100F] ${theme.primaryBg} ${theme.primaryHover} ${theme.accentRing}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Encore Fireworks</span>
              </button>

              <button
                type="button"
                onClick={relightCandles}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Relight Candles</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={isPlayingMusic ? onStopMusic : onStartMusic}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            <span>{isPlayingMusic ? 'Pause Birthday Song' : 'Play Birthday Song'}</span>
          </button>
        </div>

        {/* Surprise Gift Foil Scratch-Card + 3 Bonus Treat Envelopes */}
        <div className="mt-8 mx-auto max-w-2xl space-y-6">
          {wishGranted ? (
            <>
              <ScratchRevealCard
                friendName={data.shortName || data.friendName}
                surpriseTitle={data.surpriseTitle}
                surpriseSubtitle={data.surpriseSubtitle}
                surpriseCode={data.surpriseCode}
              />

              {/* Interactive Pick-One Bonus Treat Envelopes */}
              {data.bonusTreats.length > 0 && (
                <div className="pt-2 text-left">
                  <p className="text-xs font-medium text-white/70 mb-3">
                    Bonus Surprise · Tap a sealed card to claim one extra treat
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.bonusTreats.map((treat) => {
                      const isPicked = pickedTreatId === treat.id;
                      const anotherPicked = pickedTreatId !== null && !isPicked;
                      return (
                        <button
                          key={treat.id}
                          type="button"
                          onClick={() => handlePickTreat(treat.id)}
                          disabled={anotherPicked}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C451] ${
                            isPicked
                              ? 'bg-[#1F1C18] border-[#F5C451] text-white'
                              : anotherPicked
                              ? 'bg-[#161412]/60 border-white/5 text-white/35 cursor-not-allowed'
                              : 'bg-[#181614] border-white/15 hover:border-[#F5C451]/60 text-white'
                          }`}
                        >
                          <div className="text-[11px] font-mono text-[#F5C451] mb-1.5">
                            {isPicked ? 'Claimed' : treat.label}
                          </div>
                          <div className="text-xs md:text-sm font-medium leading-snug">
                            {isPicked ? treat.reveal : 'Tap to open this mystery treat'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#171513]/90 backdrop-blur-xs p-7 md:p-8 text-left">
              <div className="flex items-center gap-2.5 text-xs font-medium text-[#F5C451] mb-3">
                <Gift className="w-4 h-4" />
                <span>Locked Mystery Surprise · 26 November</span>
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-medium text-white/90 mb-2">
                Blow out all {candleCount} candles to unlock your golden scratch card
              </h3>
              <p className="text-sm text-white/60">
                A secret mystery surprise from {data.senderName} is sealed inside.
              </p>
            </div>
          )}

          {/* One-Tap 9:16 Birthday Story Card Export */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left">
            <div>
              <p className="text-sm font-medium text-white">Want to post this on your Story?</p>
              <p className="text-xs text-white/60 mt-0.5">
                {storyFeedback || 'Generates a 9:16 portrait card ready for Instagram, Facebook, or WhatsApp.'}
              </p>
            </div>
            <button
              type="button"
              disabled={isGeneratingStory}
              onClick={async () => {
                setIsGeneratingStory(true);
                setStoryFeedback(null);
                try {
                  const mode = await generateAndShareStoryCard(data);
                  setStoryFeedback(
                    mode === 'shared'
                      ? 'Story card ready to share.'
                      : 'Story card downloaded — ready to post!'
                  );
                } catch {
                  setStoryFeedback('Could not create story card. Please try again.');
                } finally {
                  setIsGeneratingStory(false);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#141311] bg-[#F5C451] hover:bg-[#E5B340] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingStory ? 'Preparing Card...' : 'Save Story Card'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

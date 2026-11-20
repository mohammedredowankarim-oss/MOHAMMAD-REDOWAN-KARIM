import { useEffect, useRef, useState } from 'react';
import { Eye, Gift } from 'lucide-react';

interface ScratchRevealCardProps {
  friendName: string;
  surpriseTitle: string;
  surpriseSubtitle: string;
  surpriseCode: string;
}

export function ScratchRevealCard({
  friendName,
  surpriseTitle,
  surpriseSubtitle,
  surpriseCode,
}: ScratchRevealCardProps) {
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeCountRef = useRef(0);

  // Paint metallic rose-gold foil layer on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || revealed) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Brushed rose-gold & champagne foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#D4A574');
    grad.addColorStop(0.35, '#E9C9A8');
    grad.addColorStop(0.65, '#C88D55');
    grad.addColorStop(1, '#DFB48C');

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle diagonal foil sheen lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;
    for (let x = -height; x < width + height; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    // Crisp dark engraved prompt text on foil
    const isNarrow = width < 400;
    ctx.fillStyle = 'rgba(20, 19, 17, 0.8)';
    ctx.textAlign = 'center';
    ctx.font = `600 ${isNarrow ? 14 : 16}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(`Scratch Here to Uncover ${friendName}'s Surprise`, width / 2, height / 2 - 6, width - 32);

    ctx.fillStyle = 'rgba(20, 19, 17, 0.6)';
    ctx.font = `400 ${isNarrow ? 11 : 12}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText('Swipe across the golden foil with your finger', width / 2, height / 2 + 18, width - 32);
  }, [friendName, revealed]);

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let transparentCount = 0;
    const step = 16; // sample every 16th pixel for fast performance
    let sampled = 0;

    for (let i = 3; i < pixels.length; i += 4 * step) {
      sampled++;
      if (pixels[i] < 128) {
        transparentCount++;
      }
    }

    const pct = sampled > 0 ? Math.round((transparentCount / sampled) * 100) : 0;
    setScratchedPercent(pct);
    if (pct >= 42) {
      setRevealed(true);
    }
  };

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 42;

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    } else {
      ctx.moveTo(x - 0.5, y - 0.5);
    }
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
    strokeCountRef.current += 1;
    if (strokeCountRef.current % 6 === 0) {
      checkScratchProgress();
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative rounded-2xl border border-[#F5C451]/45 bg-[#1C1A17] p-7 md:p-9 text-left overflow-hidden min-h-[190px] flex flex-col justify-center"
      >
        {/* Underlying Surprise Content */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#F5C451]">
            <Gift className="w-4 h-4" />
            <span>Surprise Unlocked</span>
          </div>
          <span className="font-mono tabular-nums text-xs text-white/65">{surpriseCode}</span>
        </div>

        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2.5">
          {surpriseTitle}
        </h3>
        <p className="text-sm md:text-base text-white/80 leading-relaxed">{surpriseSubtitle}</p>

        {/* Interactive Scratch Foil Canvas Overlay */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              isDrawingRef.current = true;
              lastPointRef.current = null;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!isDrawingRef.current) return;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              isDrawingRef.current = false;
              lastPointRef.current = null;
              checkScratchProgress();
            }}
            onPointerCancel={() => {
              isDrawingRef.current = false;
              lastPointRef.current = null;
            }}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair rounded-2xl"
          />
        )}
      </div>

      {!revealed && (
        <div className="flex items-center justify-between gap-4 text-xs text-white/60 px-1">
          <span className="font-mono tabular-nums">Foil cleared: {scratchedPercent}%</span>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Reveal Instantly</span>
          </button>
        </div>
      )}
    </div>
  );
}

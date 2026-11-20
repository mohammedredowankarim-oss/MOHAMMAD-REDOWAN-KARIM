import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { MemoryItem } from '../types/birthday';
import { SafeImage } from './SafeImage';

interface MemoriesBentoProps {
  memories: MemoryItem[];
  friendName: string;
}

export function MemoriesBento({ memories, friendName }: MemoriesBentoProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === null ? null : (prev + 1) % memories.length));
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + memories.length) % memories.length
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, memories.length]);

  const activeMemory = activeIndex !== null ? memories[activeIndex] : null;

  return (
    <section id="memories" className="py-12 md:py-16 border-t border-[#EAE4DC]">
      <div className="max-w-[1140px] mx-auto px-6">
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-[#6B645C] mb-1.5">
              Captured Moments · {memories.length} Frames
            </p>
            <h2
              className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#161412]"
              style={{ textWrap: 'balance' }}
            >
              Favorite memories with {friendName}
            </h2>
          </div>
          <p className="text-xs text-[#6B645C]">Click any photograph to view full size &amp; story</p>
        </div>

        {/* Balanced Orientation-Matched Bento Gallery (Zero Gaps) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {memories.map((memory, index) => {
            const isWide =
              memories.length >= 7
                ? index === 0 || index === 6
                : memories.length === 4
                ? false
                : index === 0;

            return (
              <button
                key={memory.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative text-left rounded-2xl overflow-hidden border border-[#EAE4DC] bg-[#EDE7DD] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161412] transition-shadow duration-300 hover:shadow-lg ${
                  isWide
                    ? 'md:col-span-2 h-[290px] sm:h-[340px]'
                    : 'md:col-span-1 h-[340px]'
                }`}
              >
                <SafeImage
                  src={memory.imageUrl}
                  alt={memory.title}
                  fallbackTitle={memory.title}
                  className="w-full h-full object-cover object-[50%_20%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
                />

                <div
                  aria-hidden="true"
                  className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/45 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Expand className="w-3.5 h-3.5" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-1.5 text-[11px] text-white/80 mb-1">
                    <span>{memory.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{memory.location}</span>
                  </div>
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-white leading-snug">
                    {memory.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Editorial Lightbox (Shows 100% Uncropped Photo) */}
      {activeMemory && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#0B0A09]/92 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={activeMemory.title}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90dvh] overflow-y-auto bg-[#161412] border border-white/10 rounded-2xl grid grid-cols-1 lg:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Close memory viewer"
              className="absolute top-3.5 right-3.5 z-10 w-10 h-10 rounded-full bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="lg:col-span-7 bg-[#0C0B0A] flex items-center justify-center min-h-[240px] max-h-[52dvh] lg:max-h-[78vh]">
              <SafeImage
                src={activeMemory.imageUrl}
                alt={activeMemory.title}
                fallbackTitle={activeMemory.title}
                className="w-full h-full max-h-[52dvh] lg:max-h-[78vh] object-contain"
              />
            </div>

            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between text-[#FAF7F2]">
              <div>
                <div className="flex items-center gap-2 text-xs text-white/65 mb-3">
                  <span className="font-mono tabular-nums">
                    {String(activeIndex + 1).padStart(2, '0')} /{' '}
                    {String(memories.length).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeMemory.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeMemory.location}</span>
                </div>

                <h3 className="font-serif text-2xl font-semibold text-white mb-4 leading-tight">
                  {activeMemory.title}
                </h3>

                <p className="text-[15px] text-white/80 leading-[1.7]">{activeMemory.story}</p>
              </div>

              {memories.length > 1 && (
                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((activeIndex - 1 + memories.length) % memories.length)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((activeIndex + 1) % memories.length)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

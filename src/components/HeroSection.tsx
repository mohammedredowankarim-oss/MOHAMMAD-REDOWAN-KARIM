import { useEffect, useState } from 'react';
import { ArrowDownRight, Music, Pause } from 'lucide-react';
import { ACCENT_THEMES, BirthdayGiftData } from '../types/birthday';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  data: BirthdayGiftData;
  isFriendView: boolean;
  isPlayingMusic: boolean;
  onOpenCustomizer: () => void;
  onToggleMusic: () => void;
}

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isBirthdayArrived: boolean;
}

function computeCountdown(dateString: string): CountdownState {
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isBirthdayArrived: true };
  }
  const [year, month, day] = parts;
  const target = new Date(year, month - 1, day, 0, 0, 0).getTime();
  const diff = target - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isBirthdayArrived: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isBirthdayArrived: false,
  };
}

function formatReadableDate(dateString: string): string {
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateString;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HeroSection({
  data,
  isFriendView,
  isPlayingMusic,
  onOpenCustomizer,
  onToggleMusic,
}: HeroSectionProps) {
  const [countdown, setCountdown] = useState<CountdownState>(() => computeCountdown(data.birthdayDate));
  const theme = ACCENT_THEMES[data.accentTheme];

  useEffect(() => {
    setCountdown(computeCountdown(data.birthdayDate));
    const interval = window.setInterval(() => {
      setCountdown(computeCountdown(data.birthdayDate));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [data.birthdayDate]);

  return (
    <section id="welcome" className="relative overflow-hidden pt-6 pb-10 md:pt-14 md:pb-18">
      {/* Rich Atmospheric Front-Page Background Photo */}
      {data.heroBgImageUrl && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SafeImage
            src={data.heroBgImageUrl}
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/94 via-[#FAF7F2]/76 to-[#FAF7F2]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-transparent to-[#FAF7F2]/40" />
        </div>
      )}

      <div className="relative z-10 max-w-[1140px] mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-stretch">
          {/* Left Column: Poetic Greeting + Compact Countdown */}
          <div className="lg:col-span-6 flex flex-col justify-center py-1 sm:py-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#5C554E] mb-3.5 sm:mb-4">
              <span>{data.milestoneLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{formatReadableDate(data.birthdayDate)}</span>
              <span aria-hidden="true">·</span>
              <span>From {data.senderName}</span>
            </div>

            <h1
              className="font-serif font-semibold tracking-tight text-[#161412] leading-[1.08] mb-4 sm:mb-5"
              style={{
                fontSize: 'clamp(2.1rem, 3.6vw, 3.45rem)',
                textWrap: 'balance',
              }}
            >
              Happy Birthday,{' '}
              <span className={`italic font-medium ${theme.primaryText}`}>{data.friendName}.</span>
            </h1>

            {/* Prominent Eye-Catching Opening Note */}
            {data.openingNote && (
              <div className="mb-5 sm:mb-6 rounded-xl border border-[#DFD5C9] bg-white/88 backdrop-blur-xs p-4 sm:p-5 shadow-xs">
                <p className={`text-[11px] font-semibold tracking-wide mb-1.5 ${theme.primaryText}`}>
                  A Note For You · {formatReadableDate(data.birthdayDate)}
                </p>
                <p className="font-serif italic text-[15px] sm:text-[17px] text-[#1D1A17] leading-[1.62]">
                  “{data.openingNote}”
                </p>
              </div>
            )}

            <p className="text-sm text-[#4D4740] leading-relaxed max-w-[50ch] mb-5 sm:mb-6">
              {data.heroSubtitle}
            </p>

            {/* Sleek Inline Countdown */}
            <div className="border-y border-[#E2DAD0] py-3.5 sm:py-4 mb-6">
              {countdown.isBirthdayArrived ? (
                <p className="font-serif text-lg font-semibold text-[#161412]">
                  Today is your day — light the candles below.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                  <span className="text-xs font-medium text-[#5C554E]">
                    Counting down to {formatReadableDate(data.birthdayDate)}
                  </span>
                  <div className="flex items-baseline gap-5 font-mono tabular-nums text-[#161412]">
                    <div className="text-center">
                      <span className="text-xl md:text-2xl font-medium">
                        {String(countdown.days).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-[#5C554E] ml-0.5">d</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl md:text-2xl font-medium">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-[#5C554E] ml-0.5">h</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl md:text-2xl font-medium">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-[#5C554E] ml-0.5">m</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl md:text-2xl font-medium">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] text-[#5C554E] ml-0.5">s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Action Row */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#make-a-wish"
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.primaryBg} ${theme.primaryHover} ${theme.accentRing}`}
              >
                <span>Open Your Surprise</span>
                <ArrowDownRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onToggleMusic}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#161412] bg-white/90 border border-[#E2DAD0] hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161412]"
              >
                {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                <span>{isPlayingMusic ? 'Pause Song' : 'Play Birthday Song'}</span>
              </button>

              {!isFriendView && (
                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  className="px-4 py-2.5 text-sm font-medium text-[#5C554E] hover:text-[#161412] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161412] rounded-sm"
                >
                  Personalize
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Warm Golden-Hour Portrait Frame */}
          <div className="lg:col-span-6 flex">
            <figure className="relative w-full min-h-[340px] lg:min-h-[460px] rounded-2xl overflow-hidden border border-[#E2DAD0] bg-[#EDE7DD] shadow-sm">
              <SafeImage
                src={data.heroImageUrl}
                alt={`Birthday celebration portrait of ${data.friendName}`}
                fallbackTitle={data.heroCaption}
                className="w-full h-full lg:h-full object-cover object-[50%_25%]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none"
              />
              <figcaption className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-4 text-xs text-white/95">
                <span>{data.heroCaption}</span>
                <span className="font-mono tabular-nums text-white/80">
                  {formatReadableDate(data.birthdayDate)}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

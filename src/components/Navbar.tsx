import { ACCENT_THEMES, AccentTheme } from '../types/birthday';

interface NavbarProps {
  accentTheme: AccentTheme;
  isFriendView: boolean;
  isPlayingMusic: boolean;
  onOpenCustomizer: () => void;
  onToggleMusic: () => void;
}

export function Navbar({
  accentTheme,
  isFriendView,
  isPlayingMusic,
  onOpenCustomizer,
  onToggleMusic,
}: NavbarProps) {
  const theme = ACCENT_THEMES[accentTheme];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/92 backdrop-blur-md border-b border-[#EAE4DC]">
      <div className="max-w-[1140px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#welcome"
          className="font-serif text-xl font-semibold tracking-tight text-[#161412] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161412] rounded-sm"
        >
          For Mim
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#645E56]">
          <a
            href="#welcome"
            className="hover:text-[#161412] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Welcome
          </a>
          <a
            href="#memories"
            className="hover:text-[#161412] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Memories
          </a>
          <a
            href="#keepsake"
            className="hover:text-[#161412] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Note &amp; Stars
          </a>
          <a
            href="#make-a-wish"
            className="hover:text-[#161412] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Surprise
          </a>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center shrink-0">
          {isFriendView ? (
            <button
              type="button"
              onClick={onToggleMusic}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.primaryBg} ${theme.primaryHover} ${theme.accentRing}`}
            >
              {isPlayingMusic ? 'Pause Melody' : 'Play Melody'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#161412] hover:bg-[#2F2B27] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#161412]"
            >
              Edit &amp; Share
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

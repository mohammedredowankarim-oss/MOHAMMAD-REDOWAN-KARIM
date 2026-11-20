import { useCallback, useEffect, useRef, useState } from 'react';
import { CelebrationStage } from './components/CelebrationStage';
import { CustomizerDrawer } from './components/CustomizerDrawer';
import { HeroSection } from './components/HeroSection';
import { LetterAndSky } from './components/LetterAndSky';
import { MemoriesBento } from './components/MemoriesBento';
import { Navbar } from './components/Navbar';
import { BirthdayGiftData, DEFAULT_GIFT_DATA } from './types/birthday';
import { MelodyController, playHappyBirthdayMelody } from './utils/audio';
import {
  clearDraftStorage,
  decodeGiftFromHash,
  isFriendGiftUrl,
  loadDraftFromStorage,
  saveDraftToStorage,
} from './utils/share';
import { generateAndShareStoryCard } from './utils/storyCard';

export default function App() {
  const [sharedGiftMode, setSharedGiftMode] = useState<boolean>(() => isFriendGiftUrl());
  const [previewFriendView, setPreviewFriendView] = useState(false);

  const [giftData, setGiftData] = useState<BirthdayGiftData>(() => {
    const fromHash = decodeGiftFromHash(window.location.hash);
    if (fromHash) return fromHash;
    if (isFriendGiftUrl()) return DEFAULT_GIFT_DATA;
    const fromDraft = loadDraftFromStorage();
    return fromDraft || DEFAULT_GIFT_DATA;
  });

  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [footerStoryStatus, setFooterStoryStatus] = useState<string | null>(null);
  const melodyRef = useRef<MelodyController | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const decoded = decodeGiftFromHash(window.location.hash);
      if (decoded) {
        setGiftData(decoded);
        setSharedGiftMode(true);
        setCustomizerOpen(false);
      } else if (isFriendGiftUrl()) {
        setSharedGiftMode(true);
        setCustomizerOpen(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!sharedGiftMode) {
      saveDraftToStorage(giftData);
    }
  }, [giftData, sharedGiftMode]);

  const startMusic = useCallback(() => {
    melodyRef.current?.stop();
    setIsPlayingMusic(true);
    melodyRef.current = playHappyBirthdayMelody(() => {
      setIsPlayingMusic(false);
      melodyRef.current = null;
    });
  }, []);

  const stopMusic = useCallback(() => {
    melodyRef.current?.stop();
    melodyRef.current = null;
    setIsPlayingMusic(false);
  }, []);

  const toggleMusic = useCallback(() => {
    if (isPlayingMusic) {
      stopMusic();
    } else {
      startMusic();
    }
  }, [isPlayingMusic, startMusic, stopMusic]);

  useEffect(() => {
    return () => {
      melodyRef.current?.stop();
    };
  }, []);

  const handleReset = () => {
    clearDraftStorage();
    setGiftData(DEFAULT_GIFT_DATA);
  };

  const handleFooterStorySave = async () => {
    try {
      const mode = await generateAndShareStoryCard(giftData);
      setFooterStoryStatus(mode === 'shared' ? 'Ready to share' : 'Story card saved');
      window.setTimeout(() => setFooterStoryStatus(null), 2600);
    } catch {
      setFooterStoryStatus('Could not save');
    }
  };

  const isFriendView = sharedGiftMode || previewFriendView;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#161412]">
      <Navbar
        accentTheme={giftData.accentTheme}
        isFriendView={isFriendView}
        isPlayingMusic={isPlayingMusic}
        onOpenCustomizer={() => setCustomizerOpen(true)}
        onToggleMusic={toggleMusic}
      />

      <main className="flex-1">
        <HeroSection
          data={giftData}
          isFriendView={isFriendView}
          isPlayingMusic={isPlayingMusic}
          onOpenCustomizer={() => setCustomizerOpen(true)}
          onToggleMusic={toggleMusic}
        />

        <MemoriesBento
          memories={giftData.memories}
          friendName={giftData.shortName || giftData.friendName}
        />

        <LetterAndSky data={giftData} />

        <CelebrationStage
          data={giftData}
          isPlayingMusic={isPlayingMusic}
          onStartMusic={startMusic}
          onStopMusic={stopMusic}
        />
      </main>

      <footer className="bg-[#11100F] border-t border-white/10 text-white/60 py-7">
        <div className="max-w-[1140px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span>Made for {giftData.friendName}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>26 November</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={handleFooterStorySave}
              className="text-white/80 hover:text-white hover:underline underline-offset-4 cursor-pointer"
            >
              {footerStoryStatus || 'Save for Story (9:16)'}
            </button>

            {previewFriendView && !sharedGiftMode && (
              <button
                type="button"
                onClick={() => setPreviewFriendView(false)}
                className="text-white hover:underline underline-offset-4 cursor-pointer"
              >
                Exit Preview
              </button>
            )}

            {!isFriendView && (
              <button
                type="button"
                onClick={() => setCustomizerOpen(true)}
                className="text-white/80 hover:text-white hover:underline underline-offset-4 cursor-pointer"
              >
                Edit &amp; Share
              </button>
            )}
          </div>
        </div>
      </footer>

      {!sharedGiftMode && (
        <CustomizerDrawer
          isOpen={customizerOpen}
          data={giftData}
          onChange={setGiftData}
          onClose={() => setCustomizerOpen(false)}
          onReset={handleReset}
          onEnterFriendPreview={() => setPreviewFriendView(true)}
        />
      )}
    </div>
  );
}

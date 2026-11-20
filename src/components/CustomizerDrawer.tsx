import { ChangeEvent, useState } from 'react';
import { Check, Copy, Eye, RotateCcw, Upload, X } from 'lucide-react';
import {
  ACCENT_THEMES,
  AccentTheme,
  BirthdayGiftData,
  DEFAULT_GIFT_DATA,
  MemoryItem,
} from '../types/birthday';
import { compressImageFile, encodeGiftToHash } from '../utils/share';

interface CustomizerDrawerProps {
  isOpen: boolean;
  data: BirthdayGiftData;
  onChange: (next: BirthdayGiftData) => void;
  onClose: () => void;
  onReset: () => void;
  onEnterFriendPreview: () => void;
}

type StudioTab = 'edit' | 'share';

export function CustomizerDrawer({
  isOpen,
  data,
  onChange,
  onClose,
  onReset,
  onEnterFriendPreview,
}: CustomizerDrawerProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('edit');
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateField = <K extends keyof BirthdayGiftData>(key: K, value: BirthdayGiftData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleHeroImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setNotice(null);
      const dataUrl = await compressImageFile(file, 720, 0.72);
      updateField('heroImageUrl', dataUrl);
      setNotice('Main photo updated.');
    } catch {
      setNotice('Could not read that image. Please try a JPG or PNG.');
    }
  };

  const handleHeroBgUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setNotice(null);
      const dataUrl = await compressImageFile(file, 960, 0.74);
      updateField('heroBgImageUrl', dataUrl);
      setNotice('Front-page background photo updated.');
    } catch {
      setNotice('Could not read that image. Please try a JPG or PNG.');
    }
  };

  const handleMemoryImageUpload = async (memoryId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setNotice(null);
      const dataUrl = await compressImageFile(file, 640, 0.7);
      updateField(
        'memories',
        data.memories.map((m) => (m.id === memoryId ? { ...m, imageUrl: dataUrl } : m))
      );
      setNotice('Memory photo updated.');
    } catch {
      setNotice('Could not read that image. Please try a JPG or PNG.');
    }
  };

  const updateMemory = (id: string, patch: Partial<MemoryItem>) => {
    updateField(
      'memories',
      data.memories.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const getShareUrl = () => {
    const hash = encodeGiftToHash(data);
    if (hash === '#for=mim') {
      return `${window.location.origin}${window.location.pathname}?for=mim`;
    }
    return `${window.location.origin}${window.location.pathname}${hash}`;
  };

  const handleCopyShareLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.location.hash = encodeGiftToHash(data);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Edit & Share Birthday Gift"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-lg bg-[#FAF7F2] text-[#161412] h-full flex flex-col border-l border-[#EAE4DC] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#EAE4DC] bg-white flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#161412]">Edit &amp; Share</h2>
            <p className="text-xs text-[#6B645C] mt-0.5">
              Customize quickly, then copy the surprise link for {data.shortName || data.friendName}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close studio"
            className="w-10 h-10 rounded-lg border border-[#EAE4DC] hover:bg-[#F2ECE3] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simple 2-Tab Bar */}
        <div className="px-6 py-3 bg-white border-b border-[#EAE4DC]">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F2ECE3] rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-white text-[#161412] shadow-xs'
                  : 'text-[#645E56] hover:text-[#161412]'
              }`}
            >
              Edit Details &amp; Photos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'share'
                  ? 'bg-white text-[#161412] shadow-xs'
                  : 'text-[#645E56] hover:text-[#161412]'
              }`}
            >
              Preview &amp; Share Link
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {notice && (
            <div className="px-4 py-2.5 rounded-lg bg-white border border-[#EAE4DC] text-xs font-medium text-[#161412]">
              {notice}
            </div>
          )}

          {activeTab === 'edit' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-medium text-[#645E56] mb-1">Full Name</span>
                  <input
                    type="text"
                    value={data.friendName}
                    onChange={(e) => updateField('friendName', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAE4DC] rounded-lg"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-[#645E56] mb-1">Nickname</span>
                  <input
                    type="text"
                    value={data.shortName}
                    onChange={(e) => updateField('shortName', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAE4DC] rounded-lg"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-medium text-[#645E56] mb-1">Birthday Date</span>
                  <input
                    type="date"
                    value={data.birthdayDate}
                    onChange={(e) => updateField('birthdayDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAE4DC] rounded-lg"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-[#645E56] mb-1">From (You)</span>
                  <input
                    type="text"
                    value={data.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAE4DC] rounded-lg"
                  />
                </label>
              </div>

              <div className="p-4 bg-white border border-[#EAE4DC] rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-[#161412]">Main Cover Photo</span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F2ECE3] hover:bg-[#EAE4DC] rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <div className="pt-3 border-t border-[#EAE4DC] flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-[#161412]">Front-Page Background</span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F2ECE3] hover:bg-[#EAE4DC] rounded-lg cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Backdrop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroBgUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#645E56] mb-1.5">Theme Color</span>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(ACCENT_THEMES) as AccentTheme[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateField('accentTheme', key)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                        data.accentTheme === key
                          ? 'bg-[#161412] text-white border-[#161412]'
                          : 'bg-white text-[#161412] border-[#EAE4DC] hover:bg-[#F2ECE3]'
                      }`}
                    >
                      {ACCENT_THEMES[key].name}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="block text-xs font-medium text-[#645E56] mb-1">
                  Opening Spotlight Note (Shown at Top)
                </span>
                <textarea
                  rows={3}
                  value={data.openingNote}
                  onChange={(e) => updateField('openingNote', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#EAE4DC] rounded-lg leading-relaxed"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-[#645E56] mb-1">
                  Personal Letter
                </span>
                <textarea
                  rows={4}
                  value={data.letterBody}
                  onChange={(e) => updateField('letterBody', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#EAE4DC] rounded-lg leading-relaxed"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-[#645E56] mb-1">
                  Secret Postscript
                </span>
                <input
                  type="text"
                  value={data.letterPostscript}
                  onChange={(e) => updateField('letterPostscript', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#EAE4DC] rounded-lg"
                />
              </label>

              <div className="p-4 bg-white border border-[#EAE4DC] rounded-xl space-y-3">
                <span className="block text-xs font-semibold text-[#161412]">
                  Scratch-Card Surprise (Revealed After Candles)
                </span>
                <input
                  type="text"
                  value={data.surpriseTitle}
                  onChange={(e) => updateField('surpriseTitle', e.target.value)}
                  placeholder="Surprise Gift Title"
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#EAE4DC] rounded-lg"
                />
                <textarea
                  rows={2}
                  value={data.surpriseSubtitle}
                  onChange={(e) => updateField('surpriseSubtitle', e.target.value)}
                  placeholder="Surprise Gift Message"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE4DC] rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-semibold text-[#161412]">
                  {data.memories.length} Memory Photos
                </span>
                {data.memories.map((mem, idx) => (
                  <div
                    key={mem.id}
                    className="p-3.5 bg-white border border-[#EAE4DC] rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-[#6B645C]">0{idx + 1}.</span>
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#F2ECE3] hover:bg-[#EAE4DC] rounded-md cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMemoryImageUpload(mem.id, e)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={mem.title}
                      onChange={(e) => updateMemory(mem.id, { title: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-[#FAF7F2] border border-[#EAE4DC] rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-5 bg-white border border-[#EAE4DC] rounded-xl space-y-4">
                <h3 className="font-serif text-lg font-semibold text-[#161412]">
                  Ready to Surprise {data.shortName || data.friendName}
                </h3>
                <p className="text-sm text-[#645E56] leading-relaxed">
                  Copy your personalized link below. When she opens it, all editing buttons stay
                  hidden so she gets the pure birthday experience.
                </p>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#161412] hover:bg-[#2F2B27] rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Gift Link Copied!' : 'Copy Surprise Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEnterFriendPreview();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#161412] bg-[#F2ECE3] hover:bg-[#EAE4DC] rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Friend&apos;s View</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onReset();
                  setNotice('Reset to default 26 November keepsake.');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B645C] hover:text-[#B8334A] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default ({DEFAULT_GIFT_DATA.shortName})</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

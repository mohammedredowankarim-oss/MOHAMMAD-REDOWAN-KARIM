import { BirthdayGiftData, DEFAULT_GIFT_DATA } from '../types/birthday';

const STORAGE_KEY = 'birthday_edition_draft_v7';

function toBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Utf8(b64: string): string {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function isDefaultGiftData(data: BirthdayGiftData): boolean {
  return JSON.stringify(data) === JSON.stringify(DEFAULT_GIFT_DATA);
}

export function encodeGiftToHash(data: BirthdayGiftData): string {
  if (isDefaultGiftData(data)) {
    return '#for=mim';
  }
  const json = JSON.stringify(data);
  return `#gift=${toBase64Utf8(json)}`;
}

export function isFriendGiftUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  if (params.get('edit') === '1') return false;
  if (params.get('for') === 'mim') return true;
  if (hash === '#for=mim' || hash.startsWith('#gift=')) return true;
  // Creator workspace URLs keep editing enabled unless ?for=mim or #gift= is used
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('ais-dev-')) {
    return false;
  }
  // Any shared or deployed website URL (ais-pre-*, Cloud Run *.run.app, Netlify, Vercel, etc.) opens directly in Mim-only view
  return true;
}

export function decodeGiftFromHash(hash: string): BirthdayGiftData | null {
  if (!hash) return null;
  if (hash === '#for=mim') return DEFAULT_GIFT_DATA;
  if (!hash.startsWith('#gift=')) return null;
  try {
    const encoded = hash.slice(6);
    const json = fromBase64Utf8(encoded);
    const parsed = JSON.parse(json) as Partial<BirthdayGiftData>;
    return {
      ...DEFAULT_GIFT_DATA,
      ...parsed,
      memories:
        Array.isArray(parsed.memories) && parsed.memories.length > 0
          ? parsed.memories
          : DEFAULT_GIFT_DATA.memories,
      starWishes:
        Array.isArray(parsed.starWishes) && parsed.starWishes.length > 0
          ? parsed.starWishes
          : DEFAULT_GIFT_DATA.starWishes,
      bonusTreats:
        Array.isArray(parsed.bonusTreats) && parsed.bonusTreats.length > 0
          ? parsed.bonusTreats
          : DEFAULT_GIFT_DATA.bonusTreats,
    };
  } catch {
    return null;
  }
}

export function saveDraftToStorage(data: BirthdayGiftData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadDraftFromStorage(): BirthdayGiftData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BirthdayGiftData>;
    return {
      ...DEFAULT_GIFT_DATA,
      ...parsed,
      memories:
        Array.isArray(parsed.memories) && parsed.memories.length > 0
          ? parsed.memories
          : DEFAULT_GIFT_DATA.memories,
      starWishes:
        Array.isArray(parsed.starWishes) && parsed.starWishes.length > 0
          ? parsed.starWishes
          : DEFAULT_GIFT_DATA.starWishes,
      bonusTreats:
        Array.isArray(parsed.bonusTreats) && parsed.bonusTreats.length > 0
          ? parsed.bonusTreats
          : DEFAULT_GIFT_DATA.bonusTreats,
    };
  } catch {
    return null;
  }
}

export function clearDraftStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function compressImageFile(file: File, maxDimension = 840, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export type AccentTheme = 'rose' | 'gold' | 'cobalt';

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  location: string;
  story: string;
  imageUrl: string;
}

export interface StarWish {
  id: string;
  label: string;
  message: string;
}

export interface BonusTreat {
  id: string;
  label: string;
  reveal: string;
}

export interface BirthdayGiftData {
  friendName: string;
  shortName: string;
  senderName: string;
  milestoneLabel: string;
  birthdayDate: string; // YYYY-MM-DD
  openingNote: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroBgImageUrl: string;
  heroCaption: string;
  finaleBgImageUrl: string;
  letterHeading: string;
  letterBody: string;
  letterPostscript: string;
  starWishes: StarWish[];
  memories: MemoryItem[];
  bonusTreats: BonusTreat[];
  candleCount: number;
  surpriseTitle: string;
  surpriseSubtitle: string;
  surpriseCode: string;
  accentTheme: AccentTheme;
}

export const ACCENT_THEMES: Record<
  AccentTheme,
  {
    name: string;
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
    accentRing: string;
  }
> = {
  rose: {
    name: 'Royal Plum',
    primaryBg: 'bg-[#8E2443]',
    primaryHover: 'hover:bg-[#731C36]',
    primaryText: 'text-[#8E2443]',
    accentRing: 'focus-visible:ring-[#8E2443]',
  },
  gold: {
    name: 'Burnished Gold',
    primaryBg: 'bg-[#B97B1E]',
    primaryHover: 'hover:bg-[#9E6716]',
    primaryText: 'text-[#B97B1E]',
    accentRing: 'focus-visible:ring-[#B97B1E]',
  },
  cobalt: {
    name: 'Electric Cobalt',
    primaryBg: 'bg-[#2563EB]',
    primaryHover: 'hover:bg-[#1D4ED8]',
    primaryText: 'text-[#2563EB]',
    accentRing: 'focus-visible:ring-[#2563EB]',
  },
};

export const DEFAULT_GIFT_DATA: BirthdayGiftData = {
  friendName: 'Nusrat Jahan Mim',
  shortName: 'Mim',
  senderName: 'Your Best Friend',
  milestoneLabel: '26 November Edition',
  birthdayDate: '2026-11-26',
  openingNote:
    'Dear Mim — before the candles are lit and 26 November arrives, pause for a quiet second to remember how effortlessly you make every room warmer, every laugh louder, and every ordinary day worth keeping. May this new year bring you everything your heart quietly wishes for.',
  heroSubtitle:
    'Scroll gently — every photograph, hidden star, and surprise below was put together just to see you smile.',
  heroImageUrl: '/assets/aistudio/image_c55d6f7d.png',
  heroBgImageUrl: '/src/assets/images/hero_birthday_backdrop_1795098285746.jpg',
  heroCaption: 'Golden Hour · Nusrat Jahan Mim',
  finaleBgImageUrl: '/assets/aistudio/image_4dc25f81.png',
  letterHeading: 'To Mim, who turns ordinary days into lifelong memories.',
  letterBody:
    'Some people enter our lives quietly and end up becoming the warmth behind our favorite stories. Thank you for every honest talk, every campus laugh, and the calm grace you bring everywhere you go.\n\nAs 26 November arrives, I wanted to surprise you with something you would never expect — a small corner of the web crafted entirely around your smile and our best moments together.',
  letterPostscript:
    'No matter how busy life gets, you will always have someone cheering loudest for you, Mim.',
  starWishes: [
    {
      id: 'star-1',
      label: 'Serendipity',
      message: 'May unexpected happiness find you in the middle of an ordinary week.',
    },
    {
      id: 'star-2',
      label: 'Laughter',
      message: 'May your days stay full of unfiltered laughter that never fades.',
    },
    {
      id: 'star-3',
      label: 'Adventure',
      message: 'May 26 November begin your brightest, most unforgettable chapter yet.',
    },
  ],
  memories: [
    {
      id: 'mem-1',
      title: 'With the Whole Crew',
      date: 'Heritage Walk',
      location: 'Together Again',
      story:
        'Walks that turn into hours, peace signs for the camera, and memories with the people who make every outing unforgettable.',
      imageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-19_at_6.28.30_PM_cb1831b5.jpeg',
    },
    {
      id: 'mem-2',
      title: 'Starlight & Sweet Moments',
      date: 'Warm Evenings',
      location: 'Fairy Lights',
      story:
        'Soft golden star lights overhead and a sweet cake in hand — celebrating the moments that always bring out your brightest smile.',
      imageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-19_at_6.35.04_PM_3bfb6bbc.jpeg',
    },
    {
      id: 'mem-3',
      title: 'Framed in Heritage',
      date: 'Golden Afternoon',
      location: 'Old Brick Archway',
      story:
        'Quiet elegance against timeless walls — one of those effortlessly calm frames that feels straight out of a storybook.',
      imageUrl: '/assets/aistudio/IMG_9565_b57999e3.JPG',
    },
    {
      id: 'mem-4',
      title: 'Vibrant & Unfiltered',
      date: 'Festive Colors',
      location: 'Golden Portrait',
      story:
        'Bright colors, warm eyes, and the kind of genuine smile that makes every photo worth keeping.',
      imageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-19_at_6.35.04_PM__1__2e262a55.jpeg',
    },
    {
      id: 'mem-5',
      title: 'Under the Shade of Green',
      date: 'Peaceful Afternoon',
      location: 'Sunlit Park',
      story:
        'Tall trees, afternoon sunlight, and calm serenity — a frame full of grace and effortless beauty.',
      imageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-19_at_6.35.05_PM__1__af6e8184.jpeg',
    },
    {
      id: 'mem-6',
      title: 'River Breeze & Calm Waters',
      date: 'Misty Waters',
      location: 'Wooden Boat',
      story:
        'Soft river air, gentle waves, and the peaceful smile that makes every long journey worth taking.',
      imageUrl: '/assets/aistudio/image_595c1969.png',
    },
    {
      id: 'mem-7',
      title: 'Campus Lawn & Good Vibes',
      date: 'Sunny Afternoon',
      location: 'Green Field',
      story:
        'Right in the middle of campus chaos, still finding time for a thumbs-up, a quick selfie, and nonstop jokes.',
      imageUrl: '/assets/aistudio/WhatsApp_Image_2026-11-19_at_6.21.32_PM_9c8c47c7.jpeg',
    },
  ],
  bonusTreats: [
    {
      id: 'treat-1',
      label: 'Mystery Treat 01',
      reveal: 'Your Favorite Coffee & Pastry Date — Anytime This Week',
    },
    {
      id: 'treat-2',
      label: 'Mystery Treat 02',
      reveal: 'Golden Hour Boat Ride & Photo Session on 26 Nov',
    },
    {
      id: 'treat-3',
      label: 'Mystery Treat 03',
      reveal: 'A Handpicked Wrapped Gift Waiting For You In Person',
    },
  ],
  candleCount: 5,
  surpriseTitle: 'Birthday Dinner + Secret Gift Box',
  surpriseSubtitle:
    'Fully planned just for you, Mim — your favorite dinner spot, dessert on me, and a wrapped surprise waiting for 26 November.',
  surpriseCode: 'MIM-26NOV',
  accentTheme: 'rose',
};

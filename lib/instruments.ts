export type InstrumentCategory = 'keys' | 'strings' | 'percussion' | 'wind' | 'indian';

export interface Instrument {
  slug: string;
  name: string;
  category: InstrumentCategory;
  soundfont: string;
  description: string;
  emoji: string;
  credit?: {
    author: string;
    url: string;
    note: string;
  };
  component: 'Piano' | 'Guitar' | 'Drums' | 'Harmonium' | 'Tabla' | 'GenericKeys';
}

export const INSTRUMENTS: Instrument[] = [
  // Keys
  {
    slug: 'piano',
    name: 'Piano',
    category: 'keys',
    soundfont: 'acoustic_grand_piano',
    description: 'The most popular instrument in the world. 47% of people want to learn it.',
    emoji: '🎹',
    component: 'Piano',
  },
  {
    slug: 'harmonium',
    name: 'Harmonium',
    category: 'indian',
    soundfont: 'accordion',
    description: 'The heartbeat of Indian classical and devotional music.',
    emoji: '🪗',
    component: 'Harmonium',
    credit: {
      author: 'MrAkbari91, pankaj28843, gajraj-m',
      url: 'https://github.com/MrAkbari91/web-harmonium',
      note: 'Harmonium samples and interaction patterns inspired by web-harmonium open source projects on GitHub.',
    },
  },
  // Strings
  {
    slug: 'guitar',
    name: 'Guitar',
    category: 'strings',
    soundfont: 'acoustic_guitar_nylon',
    description: 'The most searched instrument globally. 61% of beginner music students start here.',
    emoji: '🎸',
    component: 'Guitar',
  },
  {
    slug: 'ukulele',
    name: 'Ukulele',
    category: 'strings',
    soundfont: 'acoustic_guitar_nylon',
    description: 'Four strings, infinite fun. Easiest string instrument to get started on.',
    emoji: '🪕',
    component: 'GenericKeys',
  },
  {
    slug: 'violin',
    name: 'Violin',
    category: 'strings',
    soundfont: 'violin',
    description: 'Third most popular instrument globally. Rich, expressive, and timeless.',
    emoji: '🎻',
    component: 'GenericKeys',
  },
  // Percussion
  {
    slug: 'drums',
    name: 'Drums',
    category: 'percussion',
    soundfont: 'drums',
    description: 'The backbone of every track. Keep the beat, drive the energy.',
    emoji: '🥁',
    component: 'Drums',
  },
  {
    slug: 'tabla',
    name: 'Tabla',
    category: 'indian',
    soundfont: 'drums',
    description: 'The soul of Indian classical music. Dayan and bayan in perfect balance.',
    emoji: '🪘',
    component: 'Tabla',
    credit: {
      author: 'DotIAM Tools',
      url: 'https://tools.dotiam.com/tabla-simulator',
      note: 'Tabla bol patterns and layout inspired by the open tabla simulator at tools.dotiam.com.',
    },
  },
  // Wind
  {
    slug: 'flute',
    name: 'Flute',
    category: 'wind',
    soundfont: 'flute',
    description: 'Pure, airy, ethereal. One of the oldest instruments known to humanity.',
    emoji: '🪈',
    component: 'GenericKeys',
  },
  {
    slug: 'saxophone',
    name: 'Saxophone',
    category: 'wind',
    soundfont: 'alto_sax',
    description: 'Smooth, soulful, unmistakable. Jazz was built on this instrument.',
    emoji: '🎷',
    component: 'GenericKeys',
  },
  {
    slug: 'trumpet',
    name: 'Trumpet',
    category: 'wind',
    soundfont: 'trumpet',
    description: 'Bold, brassy, powerful. The instrument that makes you feel alive.',
    emoji: '🎺',
    component: 'GenericKeys',
  },
  // More strings
  {
    slug: 'bass-guitar',
    name: 'Bass Guitar',
    category: 'strings',
    soundfont: 'electric_bass_finger',
    description: 'The low-end foundation. You feel it before you hear it.',
    emoji: '🎸',
    component: 'GenericKeys',
  },
  {
    slug: 'electric-guitar',
    name: 'Electric Guitar',
    category: 'strings',
    soundfont: 'electric_guitar_clean',
    description: 'Rock, blues, jazz — it does everything. The most versatile string instrument.',
    emoji: '🎸',
    component: 'GenericKeys',
  },
  // More keys
  {
    slug: 'organ',
    name: 'Organ',
    category: 'keys',
    soundfont: 'church_organ',
    description: 'Majestic, powerful, sacred. From cathedrals to Hammond jazz.',
    emoji: '🎹',
    component: 'GenericKeys',
  },
  {
    slug: 'xylophone',
    name: 'Xylophone',
    category: 'percussion',
    soundfont: 'xylophone',
    description: 'Bright, percussive, playful. Every note rings like a bell.',
    emoji: '🎼',
    component: 'GenericKeys',
  },
  {
    slug: 'marimba',
    name: 'Marimba',
    category: 'percussion',
    soundfont: 'marimba',
    description: 'The xylophone\'s warm, resonant cousin. Deeply satisfying to play.',
    emoji: '🎼',
    component: 'GenericKeys',
  },
];

export const CATEGORIES: { id: InstrumentCategory; label: string }[] = [
  { id: 'keys', label: 'Keys' },
  { id: 'strings', label: 'Strings' },
  { id: 'percussion', label: 'Percussion' },
  { id: 'wind', label: 'Wind' },
  { id: 'indian', label: 'Indian Classical' },
];

export function getInstrument(slug: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.slug === slug);
}

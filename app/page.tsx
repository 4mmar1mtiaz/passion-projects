import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'muze — Play Any Instrument. Compose Anything.',
  description: 'Free browser-based music studio. Play 15+ real instruments with your keyboard — piano, guitar, drums, harmonium, tabla, violin and more. Record, compose, export. No download needed.',
  alternates: { canonical: 'https://muze.ammarimtiaz.com' },
  openGraph: {
    url: 'https://muze.ammarimtiaz.com',
    title: 'muze — Play Any Instrument. Compose Anything.',
    description: 'Free browser-based music studio. Play 15+ real instruments with your keyboard. Record clips, layer them on a multitrack timeline, export your music.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'muze',
  url: 'https://muze.ammarimtiaz.com',
  description: 'Free browser-based music studio. Play 15+ real instruments with your keyboard, record clips, layer them on a multitrack timeline, and export your composition.',
  applicationCategory: 'MusicApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'Ammar Imtiaz', url: 'https://ammarimtiaz.com' },
  featureList: [
    'Piano, Guitar, Drums, Harmonium, Tabla, Violin, Flute, Saxophone, Trumpet, Ukulele, Bass Guitar, Electric Guitar, Organ, Xylophone, Marimba',
    'Keyboard-controlled instruments',
    'Multitrack timeline composer',
    'Audio recording and export',
    'Projects system',
    'Indian classical instruments with raga modes',
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
          15+ instruments · Composer · Record & Export
        </div>
        <h1 className="text-6xl font-black mb-5 tracking-tight" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Play any instrument.<br />
          <span style={{ color: 'var(--accent)' }}>Compose anything.</span>
        </h1>
        <p className="text-xl max-w-xl mx-auto mb-10" style={{ color: 'var(--text-muted)' }}>
          Browser-based. No download. Play alone or layer instruments into a full composition.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/instruments" className="px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105" style={{ background: 'var(--accent)', color: '#fff' }}>
            Start Playing
          </Link>
          <Link href="/composer" className="px-7 py-3.5 rounded-xl font-semibold text-base transition-all" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)' }}>
            Open Composer
          </Link>
        </div>
      </div>

      {/* 3 Section Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Instruments */}
          <Link href="/instruments" className="group relative rounded-2xl p-8 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(110,86,255,0.08) 0%, transparent 60%)' }} />
            <div className="text-5xl mb-5">🎹</div>
            <div className="font-black text-2xl mb-2 tracking-tight">Instruments</div>
            <div className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              Piano, guitar, drums, harmonium, tabla, violin, flute and more. Keyboard, touch, and MIDI ready.
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['🎹', '🎸', '🥁', '🪘', '🪗', '🎻', '🪈', '🎷', '🎺'].map((e) => (
                <span key={e} className="text-xl">{e}</span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              Pick an instrument →
            </div>
          </Link>

          {/* Composer */}
          <Link href="/composer" className="group relative rounded-2xl p-8 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.08) 0%, transparent 60%)' }} />
            <div className="text-5xl mb-5">🎼</div>
            <div className="font-black text-2xl mb-2 tracking-tight">Composer</div>
            <div className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              Record clips from any instrument. Layer them on a timeline. Play them all back together. Export your mix.
            </div>
            {/* Mini fake waveform */}
            <div className="flex items-end gap-0.5 h-10">
              {[3,7,5,9,4,8,6,10,3,7,5,8,4,9,6,7,3,8,5,10,4,6,7,3,9,5].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h * 4}px`, background: i % 3 === 0 ? '#ff6b6b' : i % 3 === 1 ? 'var(--accent)' : '#4ade80', opacity: 0.7 }} />
              ))}
            </div>
            <div className="mt-6 flex items-center gap-1 text-sm font-semibold" style={{ color: '#ff6b6b' }}>
              Open Composer →
            </div>
          </Link>

          {/* Learn */}
          <Link href="/learn" className="group relative rounded-2xl p-8 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, transparent 60%)' }} />
            <div className="text-5xl mb-5">📖</div>
            <div className="font-black text-2xl mb-2 tracking-tight">Learn</div>
            <div className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              Guides for every instrument. Beginner-friendly. Scale trainers, chord libraries, and song tutorials.
            </div>
            <div className="flex flex-col gap-2">
              {['Piano for Beginners', 'Guitar Chords', 'Intro to Tabla', 'Raga Basics'].map((g) => (
                <div key={g} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
                  <div className="w-1 h-1 rounded-full" style={{ background: 'var(--green)' }} />
                  {g}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--green)' }}>
              Coming soon →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

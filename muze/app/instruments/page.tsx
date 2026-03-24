import Link from 'next/link';
import { INSTRUMENTS, CATEGORIES } from '@/lib/instruments';

export const metadata = {
  title: 'Play 15+ Instruments Online Free — muze',
  description: 'Play piano, guitar, drums, harmonium, tabla, violin, flute, saxophone and more in your browser. Just use your keyboard. No download, no signup.',
  alternates: { canonical: 'https://muze.ammarimtiaz.com/instruments' },
  openGraph: {
    url: 'https://muze.ammarimtiaz.com/instruments',
    title: 'Play 15+ Instruments Online Free — muze',
    description: 'Play piano, guitar, drums, harmonium, tabla, violin and more in your browser. Use your keyboard as the instrument.',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  keys: '#6e56ff',
  strings: '#fbbf24',
  percussion: '#ff6b6b',
  wind: '#38bdf8',
  indian: '#f472b6',
};

export default function InstrumentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Instruments</h1>
        <p style={{ color: 'var(--text-muted)' }}>Pick any instrument and start playing. No setup, no download.</p>
      </div>

      {CATEGORIES.map((cat) => {
        const instruments = INSTRUMENTS.filter((i) => i.category === cat.id);
        if (!instruments.length) return null;
        const color = CATEGORY_COLORS[cat.id] ?? 'var(--accent)';
        return (
          <div key={cat.id} className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: color }} />
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color }}>
                {cat.label}
              </h2>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {instruments.map((inst) => (
                <Link
                  key={inst.slug}
                  href={`/instruments/${inst.slug}`}
                  className="group rounded-2xl p-6 border transition-all hover:scale-[1.03] hover:shadow-xl relative overflow-hidden"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 70%)` }} />
                  <div className="text-4xl mb-4">{inst.emoji}</div>
                  <div className="font-bold text-base mb-1.5">{inst.name}</div>
                  <div className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {inst.description}
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold" style={{ color }}>
                    Play now →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

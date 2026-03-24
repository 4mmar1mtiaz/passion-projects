import { notFound } from 'next/navigation';
import { getInstrument, INSTRUMENTS } from '@/lib/instruments';
import InstrumentLoader from '@/components/instruments/InstrumentLoader';

export async function generateStaticParams() {
  return INSTRUMENTS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inst = getInstrument(slug);
  if (!inst) return {};
  const url = `https://muze.ammarimtiaz.com/instruments/${slug}`;
  return {
    title: `Play ${inst.name} Online Free — muze`,
    description: `Play ${inst.name} in your browser using your keyboard. ${inst.description} Free, no download, no signup.`,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: `Play ${inst.name} Online Free — muze`,
      description: `Play ${inst.name} in your browser using your keyboard. ${inst.description}`,
    },
  };
}

export default async function InstrumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const instrument = getInstrument(slug);
  if (!instrument) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center gap-4">
        <span className="text-4xl">{instrument.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold">{instrument.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{instrument.description}</p>
        </div>
      </div>

      <InstrumentLoader instrument={instrument} />

      {instrument.credit && (
        <div className="mt-12 pt-8 border-t text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <div className="font-medium mb-1" style={{ color: 'var(--text-dim)' }}>Credits</div>
          <p>{instrument.credit.note}</p>
          <a
            href={instrument.credit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            {instrument.credit.author} ↗
          </a>
        </div>
      )}
    </div>
  );
}

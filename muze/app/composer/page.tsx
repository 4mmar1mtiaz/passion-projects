import Composer from '@/components/composer/Composer';

export const metadata = {
  title: 'Multitrack Composer — muze',
  description: 'Layer recorded clips from any instrument on a multitrack timeline. Drag, arrange, and play back your full composition. Free browser-based music composer.',
  alternates: { canonical: 'https://muze.ammarimtiaz.com/composer' },
  openGraph: {
    url: 'https://muze.ammarimtiaz.com/composer',
    title: 'Multitrack Composer — muze',
    description: 'Layer recorded clips from any instrument on a multitrack timeline. Free browser-based music composer.',
  },
};

export default function ComposerPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Composer</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Layer your recorded clips. Drag them on the timeline, hit Play All.
        </p>
      </div>
      <Composer />
    </div>
  );
}

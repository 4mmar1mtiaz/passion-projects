export const metadata = {
  title: 'Learn — muze',
  description: 'Instrument guides, tutorials, and lessons. Coming soon.',
};

export default function LearnPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="text-6xl mb-6">📖</div>
      <h1 className="text-3xl font-bold mb-3">Guides & Lessons</h1>
      <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
        Step-by-step guides for every instrument. For beginners who want to actually learn, not just play.
      </p>
      <div
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-muted)' }}
      >
        Coming soon
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        {[
          { emoji: '🎹', title: 'Piano for Beginners', desc: 'Your first chords, scales, and simple songs.' },
          { emoji: '🎸', title: 'Guitar Fundamentals', desc: 'Open chords, strumming patterns, and your first song.' },
          { emoji: '🥁', title: 'Drums: The Basics', desc: 'How to keep time and build your first beat.' },
          { emoji: '🪘', title: 'Introduction to Tabla', desc: 'The 16 bols, basic taals, and hand position.' },
          { emoji: '🪗', title: 'Harmonium & Ragas', desc: 'Understanding ragas and how to practice them.' },
          { emoji: '🎻', title: 'Violin for Beginners', desc: 'Bow technique, scales, and your first melody.' },
        ].map((g) => (
          <div key={g.title} className="p-5 rounded-xl opacity-50" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-2xl mb-2">{g.emoji}</div>
            <div className="font-semibold mb-1">{g.title}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{g.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

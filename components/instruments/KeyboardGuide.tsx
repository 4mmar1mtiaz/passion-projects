'use client';

// The definitive key map — visible to user and used by all instruments
// Q row = white keys (natural notes), Number row = black keys (sharps/flats)
// Q=C4 ... \=A5, 2=C#4 ... ==F#5

export const KEY_NOTE_MAP: Record<string, string> = {
  // Q row: white keys
  'q': 'C4',  'w': 'D4',  'e': 'E4',  'r': 'F4',
  't': 'G4',  'y': 'A4',  'u': 'B4',
  'i': 'C5',  'o': 'D5',  'p': 'E5',
  '[': 'F5',  ']': 'G5',  '\\': 'A5',
  // Number row: black keys (sharps)
  '2': 'Db4', '3': 'Eb4',          // C#4 D#4 (no key between E4-F4)
  '5': 'Gb4', '6': 'Ab4', '7': 'Bb4',
              '9': 'Db5', '0': 'Eb5', // C#5 D#5 (no key between B4-C5)
  '=': 'Gb5',                        // F#5 (no key between E5-F5 or G5-A5)
};

// For display: shows what each white key plays
const WHITE_KEY_ROW = [
  { key: 'Q', note: 'C4' },
  { key: 'W', note: 'D4' },
  { key: 'E', note: 'E4' },
  { key: 'R', note: 'F4' },
  { key: 'T', note: 'G4' },
  { key: 'Y', note: 'A4' },
  { key: 'U', note: 'B4' },
  { key: 'I', note: 'C5' },
  { key: 'O', note: 'D5' },
  { key: 'P', note: 'E5' },
  { key: '[', note: 'F5' },
  { key: ']', note: 'G5' },
  { key: '\\', note: 'A5' },
];

// Black key row — null means no black key above that white key
const BLACK_KEY_ROW: ({ key: string; note: string } | null)[] = [
  null,          // nothing before Q
  { key: '2', note: 'C#4' },
  { key: '3', note: 'D#4' },
  null,          // E→F has no black key
  { key: '5', note: 'F#4' },
  { key: '6', note: 'G#4' },
  { key: '7', note: 'A#4' },
  null,          // B→C has no black key
  { key: '9', note: 'C#5' },
  { key: '0', note: 'D#5' },
  null,          // E→F has no black key
  { key: '=', note: 'F#5' },
  null,          // A5 has no sharp in range
];

interface KeyboardGuideProps {
  activeNotes?: Set<string>;
}

export default function KeyboardGuide({ activeNotes = new Set() }: KeyboardGuideProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden sticky top-20"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Keyboard Map</span>
        <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>2 octaves</span>
      </div>

      <div className="p-4">
        {/* Mini piano visual */}
        <div className="mb-4 relative" style={{ height: 72 }}>
          <div className="flex" style={{ height: 72 }}>
            {WHITE_KEY_ROW.map((wk, i) => {
              const isActive = activeNotes.has(wk.note);
              const bk = BLACK_KEY_ROW[i + 1]; // black key to the right of this white key
              return (
                <div key={wk.key} className="relative flex-1">
                  {/* White key */}
                  <div
                    className="absolute inset-0 rounded-b-sm border flex flex-col justify-end items-center pb-1 gap-0"
                    style={{
                      background: isActive ? '#c8b8ff' : '#f0f0f0',
                      borderColor: '#aaa',
                      transition: 'background 0.05s',
                    }}
                  >
                    <span className="text-[7px] font-bold leading-none" style={{ color: isActive ? '#6e56ff' : '#888' }}>
                      {wk.note.replace(/\d/, '')}
                    </span>
                    <span className="text-[7px] leading-none" style={{ color: isActive ? '#6e56ff' : '#bbb' }}>
                      {wk.key}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Black keys overlay */}
          <div className="absolute inset-0 pointer-events-none flex" style={{ height: 44 }}>
            {BLACK_KEY_ROW.slice(1).map((bk, i) => {
              if (!bk) {
                return <div key={i} className="flex-1" />;
              }
              const isActive = activeNotes.has(bk.note);
              return (
                <div key={i} className="flex-1 flex justify-center" style={{ marginLeft: '-50%' }}>
                  <div
                    className="rounded-b-sm flex flex-col justify-end items-center pb-0.5"
                    style={{
                      width: '62%',
                      height: '100%',
                      background: isActive ? '#6e56ff' : '#1a1a1a',
                      border: '1px solid #000',
                      transition: 'background 0.05s',
                    }}
                  >
                    <span className="text-[6px] font-mono leading-none" style={{ color: isActive ? '#fff' : '#888' }}>
                      {bk.key}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key table */}
        <div className="space-y-2">
          {/* Number row */}
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-1.5 font-semibold" style={{ color: 'var(--text-dim)' }}>
              Number row → Sharps / Flats
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { key: '2', note: 'C#4' }, { key: '3', note: 'D#4' },
                { key: '5', note: 'F#4' }, { key: '6', note: 'G#4' }, { key: '7', note: 'A#4' },
                { key: '9', note: 'C#5' }, { key: '0', note: 'D#5' }, { key: '=', note: 'F#5' },
              ].map(({ key, note }) => (
                <div
                  key={key}
                  className="flex flex-col items-center px-1.5 py-1 rounded"
                  style={{
                    background: '#1a1a28',
                    border: '1px solid #2a2a3a',
                    minWidth: 30,
                  }}
                >
                  <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--text)' }}>{key}</span>
                  <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Q row */}
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-1.5 font-semibold" style={{ color: 'var(--text-dim)' }}>
              Q → \ row → Natural notes
            </div>
            <div className="flex flex-wrap gap-1">
              {WHITE_KEY_ROW.map(({ key, note }) => (
                <div
                  key={key}
                  className="flex flex-col items-center px-1.5 py-1 rounded"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-2)',
                    minWidth: 30,
                  }}
                >
                  <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--text)' }}>{key}</span>
                  <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[9px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Keys 1, 4, 8, –  have no note (no black key there on a real piano)
          </div>
        </div>
      </div>
    </div>
  );
}

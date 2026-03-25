'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Instrument } from '@/lib/instruments';
import RecordBar from './RecordBar';
import LiveKeyboard, { KeyInfo } from './LiveKeyboard';
import { useKeyboard } from '@/lib/useKeyboard';
import { getEngine } from '@/lib/audioEngine';

interface Player { play: (n:string,t?:number,o?:Record<string,unknown>)=>void }

// Keyboard rows = Guitar strings. Left key = open/low fret, right key = high fret.
// Standard guitar-ish tuning: E4 (high) / B3 / G3 / E2 (low)
// Row1(num) = String 1 high E:  1=E4  2=F4  3=F#4  4=G4  5=G#4  6=A4  7=A#4  8=B4  9=C5  0=C#5  -=D5  ==D#5
// Row2(Q)   = String 2 B:       q=B3  w=C4  e=C#4  r=D4  t=D#4  y=E4  u=F4   i=F#4  o=G4  p=G#4  [=A4  ]=A#4  \=B4
// Row3(A)   = String 3 G:       a=G3  s=G#3 d=A3   f=A#3 g=B3   h=C4  j=C#4  k=D4   l=D#4 ;=E4   '=F4
// Row4(Z)   = String 4 low E:   z=E2  x=F2  c=F#2  v=G2  b=G#2  n=A2  m=A#2  ,=B2   .=C3  /=C#3

const STRINGS = [
  {
    id: 's1', name: 'String 1', tuning: 'High E', color: '#ff6b6b',
    keys: ['1','2','3','4','5','6','7','8','9','0','-','='],
    notes:['E4','F4','Gb4','G4','Ab4','A4','Bb4','B4','C5','Db5','D5','Eb5'],
  },
  {
    id: 's2', name: 'String 2', tuning: 'B', color: '#fbbf24',
    keys: ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
    notes:['B3','C4','Db4','D4','Eb4','E4','F4','Gb4','G4','Ab4','A4','Bb4','B4'],
  },
  {
    id: 's3', name: 'String 3', tuning: 'G', color: '#4ade80',
    keys: ['a','s','d','f','g','h','j','k','l',';',"'"],
    notes:['G3','Ab3','A3','Bb3','B3','C4','Db4','D4','Eb4','E4','F4'],
  },
  {
    id: 's4', name: 'String 4', tuning: 'Low E', color: '#38bdf8',
    keys: ['z','x','c','v','b','n','m',',','.','/'],
    notes:['E2','F2','Gb2','G2','Ab2','A2','Bb2','B2','C3','Db3'],
  },
];

// Build flat key→note map
const KEY_NOTE: Record<string, string> = {};
const KEY_STRING: Record<string, { color: string; stringName: string }> = {};
STRINGS.forEach(str => {
  str.keys.forEach((key, i) => {
    KEY_NOTE[key] = str.notes[i];
    KEY_STRING[key] = { color: str.color, stringName: str.name };
  });
});

// Chord shapes: [string4note, string3note, string2note, string1note] (low to high)
const CHORDS: Record<string, (string|null)[]> = {
  'Em': ['E2','B2','E3','B3'],
  'Am': ['A2','E3','A3','E4'],
  'G':  ['G2','D3','G3','B3'],
  'C':  ['C3','E3','G3','C4'],
  'D':  ['D3','A3','D4','Gb4'],
  'E':  ['E2','B2','Gb3','B3'],
};

export default function Guitar({ instrument }: { instrument: Instrument }) {
  const [loaded, setLoaded] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [activeChord, setActiveChord] = useState<string|null>(null);
  const playerRef = useRef<Player|null>(null);
  const pressedKeys = useKeyboard();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const SF = (await import('soundfont-player')).default;
      const engine = getEngine();
      if (!engine) return;
      const p = await SF.instrument(engine.ac, 'acoustic_guitar_nylon' as never, { destination: engine.masterBus } as never);
      if (!cancelled) { playerRef.current = p as unknown as Player; setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  const pluck = useCallback((note: string) => {
    if (!playerRef.current) return;
    playerRef.current.play(note, 0, { duration: 2.5, gain: 2 });
    setActiveNotes(prev => {
      const s = new Set([...prev, note]);
      setTimeout(() => setActiveNotes(p => { const n = new Set(p); n.delete(note); return n; }), 400);
      return s;
    });
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey) return;
      const key = e.key === '\\' ? '\\' : [',','.','/'].includes(e.key) ? e.key : e.key.toLowerCase();
      const note = KEY_NOTE[key];
      if (note) pluck(note);
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [pluck]);

  const strumChord = useCallback((name: string) => {
    const notes = CHORDS[name];
    if (!notes) return;
    setActiveChord(name);
    notes.forEach((note, i) => {
      if (!note) return;
      setTimeout(() => { pluck(note); }, i * 50);
    });
    setTimeout(() => setActiveChord(null), 600);
  }, [pluck]);

  // Live keyboard map
  const keyMap: Record<string, KeyInfo> = {};
  STRINGS.forEach(str => {
    str.keys.forEach((key, i) => {
      keyMap[key] = { note: str.notes[i], color: str.color, rowLabel: str.name };
    });
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2" style={{ background:'var(--surface-2)', color: loaded ? 'var(--green)':'var(--text-muted)', border:'1px solid var(--border)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: loaded ? 'var(--green)':'var(--text-dim)' }} />
          {loaded ? 'Guitar loaded' : 'Loading...'}
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color:'var(--text-dim)' }}>
          {STRINGS.map(s => (
            <span key={s.id}><span style={{ color: s.color }}>■</span> {s.tuning}</span>
          ))}
        </div>
      </div>

      {/* String visualizer — shows the 4 strings as colored lanes */}
      <div className="rounded-2xl overflow-hidden" style={{ background:'#0d0a05', border:'2px solid #2a1a00' }}>
        <div className="p-4 border-b text-xs font-semibold" style={{ borderColor:'#2a1a00', color:'var(--text-muted)' }}>
          Fretboard — each row of keys = one string. Left key = open note, right key = higher fret.
        </div>
        {STRINGS.map((str) => {
          const activeInString = str.keys.filter(k => {
            const note = KEY_NOTE[k];
            return note && activeNotes.has(note);
          });
          return (
            <div key={str.id} className="flex items-center border-b last:border-0" style={{ borderColor:'#1a1000', height:56 }}>
              {/* String label */}
              <div className="w-24 shrink-0 px-4 flex flex-col gap-0.5">
                <span className="text-xs font-bold" style={{ color: str.color }}>{str.tuning}</span>
                <span className="text-[10px]" style={{ color:'var(--text-dim)' }}>{str.name}</span>
              </div>
              {/* String line + fret dots */}
              <div className="flex-1 relative flex items-center pr-4">
                {/* String line */}
                <div className="absolute inset-y-0 flex items-center w-full">
                  <div className="w-full h-px" style={{ background:`${str.color}40` }} />
                </div>
                {/* Fret markers */}
                <div className="relative flex gap-1 flex-1">
                  {str.keys.map((key, fi) => {
                    const note = str.notes[fi];
                    const isActive = activeNotes.has(note);
                    const isPressed = pressedKeys.has(key);
                    return (
                      <button
                        key={key}
                        onClick={() => pluck(note)}
                        className="flex flex-col items-center justify-center flex-1 transition-all"
                        style={{ height: 40 }}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <div
                            className="rounded-full transition-all"
                            style={{
                              width: isActive || isPressed ? 20 : 10,
                              height: isActive || isPressed ? 20 : 10,
                              background: isActive || isPressed ? str.color : `${str.color}40`,
                              boxShadow: isActive ? `0 0 12px ${str.color}` : 'none',
                            }}
                          />
                          <span className="text-[7px] font-mono" style={{ color: isActive ? str.color : '#444' }}>
                            {key === '\\' ? '\\' : [',','.','/'].includes(key) ? key : key.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chord buttons */}
      <div>
        <div className="text-xs font-semibold mb-2" style={{ color:'var(--text-muted)' }}>Quick Chords — press to strum</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(CHORDS).map(chord => (
            <button key={chord} onClick={() => strumChord(chord)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeChord === chord ? 'var(--accent)' : 'var(--surface-2)',
                color: activeChord === chord ? '#fff' : 'var(--text)',
                border: `1px solid ${activeChord === chord ? 'var(--accent)' : 'var(--border-2)'}`,
                transform: activeChord === chord ? 'scale(0.96)' : 'scale(1)',
              }}>
              {chord}
            </button>
          ))}
        </div>
      </div>

      <RecordBar instrument={instrument} />

      <LiveKeyboard
        keyMap={keyMap}
        pressedKeys={pressedKeys}
        title="Your keyboard = Guitar fretboard"
        legend={STRINGS.map(s => ({ color: s.color, label: `${s.name} (${s.tuning})` }))}
      />
    </div>
  );
}

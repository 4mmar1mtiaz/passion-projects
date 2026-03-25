'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Instrument } from '@/lib/instruments';
import RecordBar from './RecordBar';
import LiveKeyboard, { KeyInfo } from './LiveKeyboard';
import { useKeyboard } from '@/lib/useKeyboard';
import { getEngine } from '@/lib/audioEngine';

const BOLS = [
  { id:'dha',  label:'Dha',  key:'q', note:'C2',  drum:'dayan', color:'#ff6b6b', desc:'Full open' },
  { id:'dhin', label:'Dhin', key:'w', note:'D2',  drum:'dayan', color:'#ff8c42', desc:'Resonant' },
  { id:'na',   label:'Na',   key:'e', note:'G2',  drum:'dayan', color:'#fbbf24', desc:'Edge right' },
  { id:'tin',  label:'Tin',  key:'r', note:'A2',  drum:'dayan', color:'#4ade80', desc:'Center' },
  { id:'ta',   label:'Ta',   key:'t', note:'B2',  drum:'dayan', color:'#38bdf8', desc:'Sharp' },
  { id:'ge',   label:'Ge',   key:'y', note:'C3',  drum:'bayan', color:'#a78bfa', desc:'Bass open' },
  { id:'ka',   label:'Ka',   key:'u', note:'Eb2', drum:'bayan', color:'#f472b6', desc:'Slap bass' },
  { id:'tun',  label:'Tun',  key:'i', note:'F2',  drum:'bayan', color:'#34d399', desc:'Resonant bass' },
];

const KEY_BOL = Object.fromEntries(BOLS.map(b => [b.key, b]));

const TAALS = [
  { name:'Teentaal (16)', bols:['dha','dhin','dhin','dha','dha','dhin','dhin','dha','na','tin','tin','na','dha','dhin','dhin','dha'] },
  { name:'Keherwa (8)',   bols:['dha','ge','na','tin','na','ke','dhin','na'].map(b => b === 'ke' ? 'ka' : b) },
  { name:'Dadra (6)',     bols:['dha','dhin','na','dha','tin','na'].map(b => b === 'tin' ? 'tin' : b) },
];

export default function Tabla({ instrument }: { instrument: Instrument }) {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [playingTaal, setPlayingTaal] = useState<string|null>(null);
  const playerRef = useRef<{play:(n:string,t?:number,o?:Record<string,unknown>)=>void}|null>(null);
  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const pressedKeys = useKeyboard();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const SF = (await import('soundfont-player')).default;
      const engine = getEngine();
      if (!engine) return;
      const p = await SF.instrument(engine.ac, 'woodblock' as never, { destination: engine.masterBus } as never);
      if (!cancelled) { playerRef.current = p as never; setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  const hit = useCallback((bol: typeof BOLS[0]) => {
    playerRef.current?.play(bol.note, 0, { duration:0.5, gain: bol.drum==='bayan' ? 5 : 3 });
    setActive(prev => new Set([...prev, bol.id]));
    setTimeout(() => setActive(prev => { const s=new Set(prev); s.delete(bol.id); return s; }), 200);
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey) return;
      const bol = KEY_BOL[e.key.toLowerCase()];
      if (bol) hit(bol);
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [hit]);

  const playTaal = (taal: typeof TAALS[0]) => {
    if (playingTaal) {
      timerRef.current.forEach(clearTimeout); timerRef.current = [];
      setPlayingTaal(null); return;
    }
    setPlayingTaal(taal.name);
    const beatMs = 60000/90;
    taal.bols.forEach((bolId, i) => {
      const bol = BOLS.find(b => b.id === bolId);
      if (!bol) return;
      const t = setTimeout(() => {
        hit(bol);
        if (i === taal.bols.length-1) setPlayingTaal(null);
      }, i*beatMs);
      timerRef.current.push(t);
    });
  };

  const keyMap: Record<string, KeyInfo> = {};
  BOLS.forEach(b => { keyMap[b.key] = { note: b.label, color: b.color }; });

  const dayanBols = BOLS.filter(b => b.drum==='dayan');
  const bayanBols = BOLS.filter(b => b.drum==='bayan');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2" style={{ background:'var(--surface-2)', color: loaded ? 'var(--green)':'var(--text-muted)', border:'1px solid var(--border)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: loaded ? 'var(--green)':'var(--text-dim)' }} />
          {loaded ? 'Tabla loaded' : 'Loading...'}
        </div>
        <span className="text-xs" style={{ color:'var(--text-dim)' }}>Q–E = Dayan (right) &nbsp;·&nbsp; Y–I = Bayan (left)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dayan */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#ff6b6b' }}>Dayan — Right drum (treble)</div>
          <div className="grid grid-cols-3 gap-2">
            {dayanBols.map(bol => (
              <button key={bol.id} onMouseDown={() => hit(bol)} onTouchStart={e=>{e.preventDefault();hit(bol);}}
                className={`drum-pad flex flex-col items-center justify-center h-20 gap-1 ${active.has(bol.id)?'active':''}`}
                style={{ borderColor: active.has(bol.id) ? bol.color:undefined, background: active.has(bol.id) ? `${bol.color}20`:undefined, boxShadow: active.has(bol.id) ? `0 0 20px ${bol.color}60`:undefined }}>
                <span className="text-xl font-black" style={{ color: active.has(bol.id) ? bol.color:'var(--text)' }}>{bol.label}</span>
                <span className="text-[9px]" style={{ color:'var(--text-muted)' }}>{bol.desc}</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background:'var(--border)', color:'var(--text-muted)' }}>{bol.key.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Bayan */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#a78bfa' }}>Bayan — Left drum (bass)</div>
          <div className="grid grid-cols-3 gap-2">
            {bayanBols.map(bol => (
              <button key={bol.id} onMouseDown={() => hit(bol)} onTouchStart={e=>{e.preventDefault();hit(bol);}}
                className={`drum-pad flex flex-col items-center justify-center h-20 gap-1 ${active.has(bol.id)?'active':''}`}
                style={{ borderColor: active.has(bol.id) ? bol.color:undefined, background: active.has(bol.id) ? `${bol.color}20`:undefined }}>
                <span className="text-xl font-black" style={{ color: active.has(bol.id) ? bol.color:'var(--text)' }}>{bol.label}</span>
                <span className="text-[9px]" style={{ color:'var(--text-muted)' }}>{bol.desc}</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded mt-0.5" style={{ background:'var(--border)', color:'var(--text-muted)' }}>{bol.key.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>Taal Patterns</div>
        <div className="flex flex-wrap gap-2">
          {TAALS.map(taal => (
            <button key={taal.name} onClick={() => playTaal(taal)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: playingTaal===taal.name ? 'var(--accent)':'var(--surface-2)', color: playingTaal===taal.name ? '#fff':'var(--text)', border:`1px solid ${playingTaal===taal.name ? 'var(--accent)':'var(--border-2)'}` }}>
              {playingTaal===taal.name ? '■ Stop' : '▶ '+taal.name}
            </button>
          ))}
        </div>
      </div>

      <RecordBar instrument={instrument} />
      <LiveKeyboard keyMap={keyMap} pressedKeys={pressedKeys} title="Your keyboard = Tabla bols"
        legend={[{ color:'#ff6b6b', label:'Q–T: Dayan (treble)' }, { color:'#a78bfa', label:'Y–I: Bayan (bass)' }]} />
    </div>
  );
}

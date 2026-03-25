'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Instrument } from '@/lib/instruments';
import RecordBar from './RecordBar';
import LiveKeyboard, { KeyInfo } from './LiveKeyboard';
import { useKeyboard } from '@/lib/useKeyboard';
import { getEngine } from '@/lib/audioEngine';

// Q row left→right = drum kit laid out like a real kit
const PADS = [
  { id:'kick',    label:'Kick',     key:'q', note:'C2',  color:'#ff6b6b', sub:'Bass Drum' },
  { id:'snare',   label:'Snare',    key:'w', note:'D2',  color:'#fbbf24', sub:'Snare' },
  { id:'hihat-c', label:'Hi-Hat',   key:'e', note:'Gb2', color:'#4ade80', sub:'Closed' },
  { id:'hihat-o', label:'Hi-Hat O', key:'r', note:'Bb2', color:'#4ade80', sub:'Open' },
  { id:'tom-h',   label:'Tom Hi',   key:'t', note:'A2',  color:'#38bdf8', sub:'High Tom' },
  { id:'tom-m',   label:'Tom Mid',  key:'y', note:'G2',  color:'#38bdf8', sub:'Mid Tom' },
  { id:'tom-l',   label:'Tom Low',  key:'u', note:'E2',  color:'#60a5fa', sub:'Floor Tom' },
  { id:'crash',   label:'Crash',    key:'i', note:'Bb3', color:'#a78bfa', sub:'Cymbal' },
  { id:'ride',    label:'Ride',     key:'o', note:'Db3', color:'#c084fc', sub:'Cymbal' },
  { id:'clap',    label:'Clap',     key:'p', note:'Eb2', color:'#f472b6', sub:'Clap' },
];

// A row = extra percussion
const EXTRAS = [
  { id:'cow',    label:'Cowbell', key:'a', note:'Ab3', color:'#fb923c', sub:'Cowbell' },
  { id:'tamb',   label:'Tamb',    key:'s', note:'Db4', color:'#f59e0b', sub:'Tambourine' },
  { id:'shaker', label:'Shaker',  key:'d', note:'Eb4', color:'#84cc16', sub:'Shaker' },
  { id:'rim',    label:'Rimshot', key:'f', note:'Eb2', color:'#06b6d4', sub:'Rimshot' },
];

const ALL_PADS = [...PADS, ...EXTRAS];
const KEY_PAD = Object.fromEntries(ALL_PADS.map(p => [p.key, p]));

export default function Drums({ instrument }: { instrument: Instrument }) {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Set<string>>(new Set());
  const playerRef = useRef<{play:(n:string,t?:number,o?:Record<string,unknown>)=>void}|null>(null);
  const pressedKeys = useKeyboard();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const SF = (await import('soundfont-player')).default;
      const engine = getEngine();
      if (!engine) return;
      const p = await SF.instrument(engine.ac, 'synth_drum' as never, { destination: engine.masterBus } as never);
      if (!cancelled) { playerRef.current = p as never; setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  const hit = useCallback((pad: typeof ALL_PADS[0]) => {
    playerRef.current?.play(pad.note, 0, { duration:0.5, gain:3 });
    setActive(prev => new Set([...prev, pad.id]));
    setTimeout(() => setActive(prev => { const s = new Set(prev); s.delete(pad.id); return s; }), 160);
  }, []);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey) return;
      const pad = KEY_PAD[e.key.toLowerCase()];
      if (pad) hit(pad);
    };
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [hit]);

  const keyMap: Record<string, KeyInfo> = {};
  ALL_PADS.forEach(p => { keyMap[p.key] = { note: p.label, color: p.color }; });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2" style={{ background:'var(--surface-2)', color: loaded ? 'var(--green)':'var(--text-muted)', border:'1px solid var(--border)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: loaded ? 'var(--green)':'var(--text-dim)' }} />
          {loaded ? 'Drums loaded' : 'Loading...'}
        </div>
        <span className="text-xs" style={{ color:'var(--text-dim)' }}>Q→P = main kit &nbsp;·&nbsp; A→F = extras</span>
      </div>

      {/* Main kit — Q row */}
      <div>
        <div className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>Main Kit — Q to P</div>
        <div className="grid grid-cols-5 gap-3">
          {PADS.map(pad => (
            <button key={pad.id} onMouseDown={() => hit(pad)} onTouchStart={e=>{e.preventDefault();hit(pad);}}
              className={`drum-pad flex flex-col items-center justify-center h-24 gap-1 ${active.has(pad.id)?'active':''}`}
              style={{ borderColor: active.has(pad.id) ? pad.color:undefined, background: active.has(pad.id) ? `${pad.color}20`:undefined, boxShadow: active.has(pad.id) ? `0 0 20px ${pad.color}60`:undefined }}>
              <span className="text-base font-black" style={{ color: active.has(pad.id) ? pad.color:'var(--text)' }}>{pad.label}</span>
              <span className="text-[9px]" style={{ color:'var(--text-muted)' }}>{pad.sub}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded mt-1" style={{ background:'var(--border)', color:'var(--text-muted)' }}>{pad.key.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Extras — A row */}
      <div>
        <div className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>Extras — A to F</div>
        <div className="grid grid-cols-4 gap-3">
          {EXTRAS.map(pad => (
            <button key={pad.id} onMouseDown={() => hit(pad)} onTouchStart={e=>{e.preventDefault();hit(pad);}}
              className={`drum-pad flex flex-col items-center justify-center h-20 gap-1 ${active.has(pad.id)?'active':''}`}
              style={{ borderColor: active.has(pad.id) ? pad.color:undefined, background: active.has(pad.id) ? `${pad.color}20`:undefined }}>
              <span className="text-sm font-black" style={{ color: active.has(pad.id) ? pad.color:'var(--text)' }}>{pad.label}</span>
              <span className="text-[9px]" style={{ color:'var(--text-muted)' }}>{pad.sub}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded mt-0.5" style={{ background:'var(--border)', color:'var(--text-muted)' }}>{pad.key.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <RecordBar instrument={instrument} />

      <LiveKeyboard keyMap={keyMap} pressedKeys={pressedKeys}
        title="Your keyboard = Drum kit"
        legend={[{ color:'#ff6b6b', label:'Q→P: Main kit' }, { color:'#fb923c', label:'A→F: Extras' }]} />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Instrument } from '@/lib/instruments';
import RecordBar from './RecordBar';
import LiveKeyboard, { KeyInfo } from './LiveKeyboard';
import { useKeyboard } from '@/lib/useKeyboard';
import { getEngine } from '@/lib/audioEngine';

interface Player { play:(n:string,t?:number,o?:Record<string,unknown>)=>{stop:()=>void} }

// One row = one instrument, exactly like web-harmonium inspiration
// Q→\ = white keys, number row = sharps. Octave shift buttons to go up/down.
const BASE_WHITE = ['C','D','E','F','G','A','B','C','D','E','F','G','A'];
const Q_ROW_KEYS = ['q','w','e','r','t','y','u','i','o','p','[',']','\\'];
const NUM_ROW_KEYS = ['2','3','5','6','7','9','0','='];
// black key positions: between which white keys (by index in Q_ROW_KEYS)
const BLACK_AFTER_WHITE = [0,1,3,4,5,7,8,10]; // after Q(C),W(D),R(F),T(G),Y(A),I(C5),O(D5),[=F5

const NOTES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
function noteToMidi(name:string,oct:number){return NOTES.indexOf(name)+(oct+1)*12;}
function midiToNote(midi:number){return NOTES[midi%12]+Math.floor(midi/12-1);}

function buildKeyMap(octave:number){
  const map: Record<string,string> = {};
  const baseMidi = noteToMidi('C', octave);
  // White keys: C D E F G A B C D E F G A (13 white keys)
  const whiteOffsets = [0,2,4,5,7,9,11,12,14,16,17,19,21];
  Q_ROW_KEYS.forEach((key,i) => { map[key] = midiToNote(baseMidi+whiteOffsets[i]); });
  // Black keys above white keys
  const blackOffsets = [1,3,6,8,10,13,15,18,20]; // Db Eb Gb Ab Bb Db5 Eb5 Gb5...
  const activeBlacks = [1,3,6,8,10,13,15,18]; // 8 active sharps
  NUM_ROW_KEYS.forEach((key,i) => {
    if(activeBlacks[i]!==undefined) map[key] = midiToNote(baseMidi+activeBlacks[i]);
  });
  return map;
}

const W = 50; const WH = 190; const BW = 30; const BH = 118;
// black key left positions as fraction of W from start of keyboard
const BLACK_LEFTS = [0.65,1.65,3.65,4.65,5.65,7.65,8.65,10.65];

export default function Piano({ instrument }: { instrument: Instrument }) {
  const [loaded, setLoaded] = useState(false);
  const [octave, setOctave] = useState(4);
  const [showLabels, setShowLabels] = useState(true);
  const playerRef = useRef<Player|null>(null);
  const heldRef = useRef<Map<string,{stop:()=>void}>>(new Map());
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const pressedKeys = useKeyboard();
  const keyNoteRef = useRef<Record<string,string>>(buildKeyMap(octave));

  useEffect(() => { keyNoteRef.current = buildKeyMap(octave); }, [octave]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const SF = (await import('soundfont-player')).default;
      const engine = getEngine();
      if (!engine) return;
      const p = await SF.instrument(engine.ac, 'acoustic_grand_piano' as never, { destination: engine.masterBus } as never);
      if(!cancelled){playerRef.current=p as unknown as Player;setLoaded(true);}
    })();
    return () => { cancelled = true; };
  }, []);

  const play = useCallback((note:string) => {
    if(!playerRef.current||heldRef.current.has(note))return;
    heldRef.current.set(note, playerRef.current.play(note));
    setActiveNotes(p=>new Set([...p,note]));
  },[]);
  const stop = useCallback((note:string) => {
    heldRef.current.get(note)?.stop(); heldRef.current.delete(note);
    setActiveNotes(p=>{const s=new Set(p);s.delete(note);return s;});
  },[]);

  useEffect(() => {
    const onDown=(e:KeyboardEvent)=>{
      if(e.repeat||e.metaKey||e.ctrlKey)return;
      const key = e.key==='\\'?'\\':e.key.toLowerCase();
      const note = keyNoteRef.current[key];
      if(note) play(note);
    };
    const onUp=(e:KeyboardEvent)=>{
      const key = e.key==='\\'?'\\':e.key.toLowerCase();
      const note = keyNoteRef.current[key];
      if(note) stop(note);
    };
    window.addEventListener('keydown',onDown);
    window.addEventListener('keyup',onUp);
    return()=>{window.removeEventListener('keydown',onDown);window.removeEventListener('keyup',onUp);};
  },[play,stop]);

  const keyNote = buildKeyMap(octave);
  const noteToKey = Object.fromEntries(Object.entries(keyNote).map(([k,v])=>[v,k]));
  const totalW = Q_ROW_KEYS.length * W;

  // white and black notes for current octave
  const whiteOffsets = [0,2,4,5,7,9,11,12,14,16,17,19,21];
  const baseMidi = noteToMidi('C', octave);
  const whiteNotes = whiteOffsets.map(o => midiToNote(baseMidi+o));
  const blackNotes = [1,3,6,8,10,13,15,18].map(o => midiToNote(baseMidi+o));

  // build live keyboard map
  const keyMap: Record<string,KeyInfo> = {};
  Object.entries(keyNote).forEach(([key,note]) => {
    const isBlack = NUM_ROW_KEYS.includes(key);
    keyMap[key] = { note, color: isBlack ? '#ab9dff' : '#6e56ff' };
  });

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl overflow-hidden" style={{border:'1px solid var(--border-2)'}}>
          <button onClick={()=>setOctave(o=>Math.max(1,o-1))} disabled={octave<=1}
            className="px-3 py-2 text-sm font-bold transition-all hover:bg-white/5 disabled:opacity-30"
            style={{color:'var(--text)'}}>◀</button>
          <div className="px-3 py-2 text-sm font-semibold" style={{background:'var(--surface-2)',color:'var(--accent)'}}>
            Octave {octave}
          </div>
          <button onClick={()=>setOctave(o=>Math.min(7,o+1))} disabled={octave>=7}
            className="px-3 py-2 text-sm font-bold transition-all hover:bg-white/5 disabled:opacity-30"
            style={{color:'var(--text)'}}>▶</button>
        </div>
        <button onClick={()=>setShowLabels(v=>!v)} className="text-xs px-3 py-2 rounded-lg border transition-all"
          style={{borderColor:showLabels?'var(--accent)':'var(--border-2)',color:showLabels?'var(--accent)':'var(--text-muted)',background:showLabels?'var(--accent-dim)':'transparent'}}>
          Note Labels
        </button>
        <div className="text-xs px-3 py-2 rounded-lg flex items-center gap-2" style={{background:'var(--surface-2)',color:loaded?'var(--green)':'var(--text-muted)',border:'1px solid var(--border)'}}>
          <span className="w-1.5 h-1.5 rounded-full" style={{background:loaded?'var(--green)':'var(--text-dim)'}}/>
          {loaded?'Piano ready':'Loading...'}
        </div>
        <div className="text-xs ml-auto" style={{color:'var(--text-dim)'}}>
          Q row = white keys &nbsp;·&nbsp; 2 3 5 6 7 = sharps
        </div>
      </div>

      {/* Piano keyboard — one continuous row */}
      <div className="overflow-x-auto rounded-2xl" style={{background:'#08080f',border:'2px solid #1a1a2e',padding:'24px 20px 12px'}}>
        <div className="relative select-none" style={{width:totalW,height:WH+20,minWidth:totalW}}>
          {/* White keys */}
          {whiteNotes.map((note,i) => {
            const isActive = activeNotes.has(note);
            const kb = noteToKey[note];
            return (
              <div key={note}
                className={`piano-white-key absolute flex flex-col justify-end items-center pb-3 ${isActive?'active':''}`}
                style={{left:i*W,width:W-1,height:WH,top:0,boxShadow:isActive?'0 0 16px rgba(110,86,255,0.6)':undefined}}
                onMouseDown={()=>play(note)} onMouseUp={()=>stop(note)} onMouseLeave={()=>stop(note)}
                onTouchStart={e=>{e.preventDefault();play(note);}} onTouchEnd={()=>stop(note)}>
                {showLabels && (
                  <div className="flex flex-col items-center gap-0.5">
                    {kb && <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{background:isActive?'var(--accent)':'#ddd',color:isActive?'#fff':'#555'}}>
                      {kb==='['?'[':kb===']'?']':kb==='\\'?'\\':kb.toUpperCase()}
                    </span>}
                    <span className="text-[9px]" style={{color:isActive?'#6e56ff':'#bbb'}}>{note}</span>
                  </div>
                )}
              </div>
            );
          })}
          {/* Black keys */}
          {BLACK_LEFTS.map((leftFrac,i) => {
            const note = blackNotes[i];
            if(!note) return null;
            const isActive = activeNotes.has(note);
            const kb = noteToKey[note];
            return (
              <div key={note}
                className={`piano-black-key absolute flex flex-col justify-end items-center pb-2 ${isActive?'active':''}`}
                style={{left:leftFrac*W,width:BW,height:BH,top:0,boxShadow:isActive?'0 0 14px var(--accent)':undefined}}
                onMouseDown={e=>{e.stopPropagation();play(note);}} onMouseUp={()=>stop(note)} onMouseLeave={()=>stop(note)}
                onTouchStart={e=>{e.preventDefault();e.stopPropagation();play(note);}} onTouchEnd={()=>stop(note)}>
                {showLabels && kb && <span className="text-[8px] font-mono font-bold"
                  style={{color:isActive?'#fff':'#888'}}>{kb.toUpperCase()}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <RecordBar instrument={instrument}/>

      <LiveKeyboard keyMap={keyMap} pressedKeys={pressedKeys}
        title="Your keyboard = Piano — Q row is one full octave"
        legend={[{color:'#6e56ff',label:'Q→\\ = White keys (C to A)'},{color:'#ab9dff',label:'2 3 5 6 7 9 0 = = Sharps/Flats'}]}/>
    </div>
  );
}

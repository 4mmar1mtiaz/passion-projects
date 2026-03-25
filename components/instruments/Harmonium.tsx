'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Instrument } from '@/lib/instruments';
import RecordBar from './RecordBar';
import LiveKeyboard, { KeyInfo } from './LiveKeyboard';
import { useKeyboard } from '@/lib/useKeyboard';
import { getEngine } from '@/lib/audioEngine';

interface Player { play:(n:string,t?:number,o?:Record<string,unknown>)=>{stop:()=>void} }

const KEY_NOTE: Record<string,string> = {
  'q':'C4','w':'D4','e':'E4','r':'F4','t':'G4','y':'A4','u':'B4',
  'i':'C5','o':'D5','p':'E5','[':'F5',']':'G5','\\':'A5',
  'a':'C3','s':'D3','d':'E3','f':'F3','g':'G3','h':'A3','j':'B3',
  'z':'C2','x':'D2','c':'E2','v':'F2','b':'G2','n':'A2','m':'B2',
  '2':'Db4','3':'Eb4','5':'Gb4','6':'Ab4','7':'Bb4','9':'Db5','0':'Eb5','=':'Gb5',
};
const WHITE_KEYS=['C2','D2','E2','F2','G2','A2','B2','C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5'];
const BLACK_MAP: Record<string,string>={'C2':'Db2','D2':'Eb2','F2':'Gb2','G2':'Ab2','A2':'Bb2','C3':'Db3','D3':'Eb3','F3':'Gb3','G3':'Ab3','A3':'Bb3','C4':'Db4','D4':'Eb4','F4':'Gb4','G4':'Ab4','A4':'Bb4','C5':'Db5','D5':'Eb5','F5':'Gb5','G5':'Ab5'};
const NOTE_TO_KEY=Object.fromEntries(Object.entries(KEY_NOTE).map(([k,v])=>[v,k]));
const BL: Record<string,number>={Db:0.68,Eb:1.68,Gb:3.68,Ab:4.68,Bb:5.68};
const W=34;const WH=160;const BW=20;const BH=100;
const ROWS_COLOR={q:'#6e56ff',a:'#38bdf8',z:'#4ade80',num:'#ab9dff'};
const RAGAS=[
  {name:'Yaman',   notes:['C4','D4','E4','Gb4','G4','A4','B4','C5']},
  {name:'Bhairav', notes:['C4','Db4','E4','F4','G4','Ab4','B4','C5']},
  {name:'Bilawal', notes:['C4','D4','E4','F4','G4','A4','B4','C5']},
];

export default function Harmonium({ instrument }: { instrument: Instrument }) {
  const [loaded,setLoaded]=useState(false);
  const [activeNotes,setActiveNotes]=useState<Set<string>>(new Set());
  const [selectedRaga,setSelectedRaga]=useState<string|null>(null);
  const [highlighted,setHighlighted]=useState<Set<string>>(new Set());
  const playerRef=useRef<Player|null>(null);
  const heldRef=useRef<Map<string,{stop:()=>void}>>(new Map());
  const pressedKeys=useKeyboard();

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      const SF=(await import('soundfont-player')).default;
      const engine=getEngine();
      if(!engine)return;
      const p=await SF.instrument(engine.ac,'accordion' as never,{destination:engine.masterBus} as never);
      if(!cancelled){playerRef.current=p as unknown as Player;setLoaded(true);}
    })();
    return ()=>{cancelled=true;};
  },[]);

  const play=useCallback((note:string)=>{
    if(!playerRef.current||heldRef.current.has(note))return;
    heldRef.current.set(note,playerRef.current.play(note,0,{duration:3}));
    setActiveNotes(p=>new Set([...p,note]));
  },[]);
  const stop=useCallback((note:string)=>{
    heldRef.current.get(note)?.stop();heldRef.current.delete(note);
    setActiveNotes(p=>{const s=new Set(p);s.delete(note);return s;});
  },[]);

  useEffect(()=>{
    const onDown=(e:KeyboardEvent)=>{
      if(e.repeat||e.metaKey||e.ctrlKey)return;
      const note=KEY_NOTE[e.key==='\\'?'\\':e.key.toLowerCase()];
      if(note)play(note);
    };
    const onUp=(e:KeyboardEvent)=>{
      const note=KEY_NOTE[e.key==='\\'?'\\':e.key.toLowerCase()];
      if(note)stop(note);
    };
    window.addEventListener('keydown',onDown);window.addEventListener('keyup',onUp);
    return()=>{window.removeEventListener('keydown',onDown);window.removeEventListener('keyup',onUp);};
  },[play,stop]);

  const selectRaga=(name:string)=>{
    if(selectedRaga===name){setSelectedRaga(null);setHighlighted(new Set());}
    else{setSelectedRaga(name);setHighlighted(new Set(RAGAS.find(r=>r.name===name)?.notes??[]));}
  };

  const keyMap:Record<string,KeyInfo>={};
  Object.entries(KEY_NOTE).forEach(([key,note])=>{
    const row=['q','w','e','r','t','y','u','i','o','p','[',']','\\'].includes(key)?'q':['a','s','d','f','g','h','j'].includes(key)?'a':['z','x','c','v','b','n','m'].includes(key)?'z':'num';
    keyMap[key]={note,color:ROWS_COLOR[row as keyof typeof ROWS_COLOR]};
  });

  const totalW=WHITE_KEYS.length*W;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2" style={{background:'var(--surface-2)',color:loaded?'var(--green)':'var(--text-muted)',border:'1px solid var(--border)'}}>
          <span className="w-1.5 h-1.5 rounded-full" style={{background:loaded?'var(--green)':'var(--text-dim)'}}/>
          {loaded?'Harmonium loaded':'Loading...'}
        </div>
        {RAGAS.map(r=>(
          <button key={r.name} onClick={()=>selectRaga(r.name)} className="text-xs px-3 py-1.5 rounded-lg border transition-all"
            style={{borderColor:selectedRaga===r.name?'var(--accent)':'var(--border-2)',color:selectedRaga===r.name?'var(--accent)':'var(--text-muted)',background:selectedRaga===r.name?'var(--accent-dim)':'transparent'}}>
            Raga {r.name}
          </button>
        ))}
      </div>
      {selectedRaga&&<div className="text-xs px-3 py-2 rounded-lg" style={{background:'var(--accent-dim)',color:'var(--accent)',border:'1px solid var(--accent)'}}>Glowing keys = Raga {selectedRaga}. Play only those notes.</div>}
      <div className="overflow-x-auto rounded-2xl" style={{background:'#1a0a00',border:'2px solid #3a1a00',padding:'16px 16px 8px'}}>
        <div className="flex gap-0.5 mb-3">{Array.from({length:18}).map((_,i)=><div key={i} className="flex-1 h-5 rounded-sm" style={{background:'#2a1500',border:'1px solid #3a2000'}}/>)}</div>
        <div className="relative select-none" style={{width:totalW,height:WH+12,minWidth:totalW}}>
          {WHITE_KEYS.map((note,i)=>{
            const isActive=activeNotes.has(note);const isHl=highlighted.has(note);const kb=NOTE_TO_KEY[note];
            const row=kb?(['q','w','e','r','t','y','u','i','o','p','[',']','\\'].includes(kb)?'q':['a','s','d','f','g','h','j'].includes(kb)?'a':'z'):null;
            const rowColor=row?ROWS_COLOR[row as keyof typeof ROWS_COLOR]:'#888';
            return(
              <div key={note} className={`piano-white-key absolute flex flex-col justify-end items-center pb-2 ${isActive?'active':''}`}
                style={{left:i*W,width:W-1,height:WH,top:0,background:isActive?`linear-gradient(to bottom,${rowColor}80,${rowColor}40)`:isHl?'linear-gradient(to bottom,#ffe8b0,#ffd080)':'linear-gradient(to bottom,#f8f8f8,#fff,#e8e8e8)',boxShadow:isHl&&!isActive?'0 0 10px rgba(255,200,0,0.5)':undefined}}
                onMouseDown={()=>play(note)} onMouseUp={()=>stop(note)} onMouseLeave={()=>stop(note)}
                onTouchStart={e=>{e.preventDefault();play(note);}} onTouchEnd={()=>stop(note)}>
                {kb&&<span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded" style={{background:isActive?rowColor:isHl?'#c07000':'#e0e0e0',color:isActive||isHl?'#fff':'#666'}}>{kb.length===1&&kb===String.fromCharCode(92)?String.fromCharCode(92):kb.toUpperCase()}</span>}
              </div>
            );
          })}
          {WHITE_KEYS.map((wk,i)=>{
            const bn=BLACK_MAP[wk]; if(!bn)return null;
            const bName=bn.replace(/\d/,'');const offset=BL[bName]; if(offset===undefined)return null;
            const left=(Math.floor(i/7)*7+offset)*W;
            const isActive=activeNotes.has(bn);const kb=NOTE_TO_KEY[bn];
            return(
              <div key={bn} className={`piano-black-key absolute flex flex-col justify-end items-center pb-1 ${isActive?'active':''}`}
                style={{left,width:BW,height:BH,top:0}}
                onMouseDown={e=>{e.stopPropagation();play(bn);}} onMouseUp={()=>stop(bn)} onMouseLeave={()=>stop(bn)}
                onTouchStart={e=>{e.preventDefault();e.stopPropagation();play(bn);}} onTouchEnd={()=>stop(bn)}>
                {kb&&<span className="text-[7px] font-mono font-bold" style={{color:isActive?'#fff':'#888'}}>{kb.length===1&&kb===String.fromCharCode(92)?String.fromCharCode(92):kb.toUpperCase()}</span>}
              </div>
            );
          })}
        </div>
      </div>
      <RecordBar instrument={instrument}/>
      <LiveKeyboard keyMap={keyMap} pressedKeys={pressedKeys} title="Your keyboard = Harmonium"
        legend={[{color:ROWS_COLOR.num,label:'Sharps'},{color:ROWS_COLOR.q,label:'Q = C4 octave'},{color:ROWS_COLOR.a,label:'A = C3 octave'},{color:ROWS_COLOR.z,label:'Z = C2 octave'}]}/>
    </div>
  );
}

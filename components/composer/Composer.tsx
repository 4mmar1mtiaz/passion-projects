'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from '@/lib/sessionContext';
import { Play, Square, Trash2, Download, Music2 } from 'lucide-react';
import Link from 'next/link';

const PX_PER_SEC = 80;
const TRACK_H = 64;

export default function Composer() {
  const { clips, removeClip, clearClips } = useSession();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [clipOffsets, setClipOffsets] = useState<Record<string, number>>({});

  // Assign default offsets for new clips
  useEffect(() => {
    setClipOffsets((prev) => {
      const next = { ...prev };
      clips.forEach((c) => { if (!(c.id in next)) next[c.id] = 0; });
      return next;
    });
  }, [clips]);

  const totalDuration = clips.reduce((max, c) => {
    const end = (clipOffsets[c.id] ?? 0) + c.duration;
    return Math.max(max, end);
  }, 10);

  const timelineWidth = totalDuration * PX_PER_SEC + 120;

  const stopPlayback = useCallback(() => {
    setPlaying(false);
    cancelAnimationFrame(rafRef.current);
    audioRefs.current.forEach((a) => { a.pause(); a.currentTime = 0; });
    setCurrentTime(0);
  }, []);

  const startPlayback = useCallback(() => {
    if (clips.length === 0) return;
    setPlaying(true);
    startTimeRef.current = performance.now();

    clips.forEach((clip) => {
      let audio = audioRefs.current.get(clip.id);
      if (!audio) {
        audio = new Audio(clip.url);
        audioRefs.current.set(clip.id, audio);
      }
      const offset = clipOffsets[clip.id] ?? 0;
      const startDelay = offset * 1000;
      setTimeout(() => {
        if (audio) { audio!.currentTime = 0; audio!.play().catch(() => {}); }
      }, startDelay);
    });

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);
      if (elapsed >= totalDuration) { stopPlayback(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [clips, clipOffsets, totalDuration, stopPlayback]);

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); }, []);

  const handleDragStart = (e: React.MouseEvent, clipId: string) => {
    const startX = e.clientX;
    const startOffset = clipOffsets[clipId] ?? 0;

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX;
      const newOffset = Math.max(0, startOffset + dx / PX_PER_SEC);
      setClipOffsets((prev) => ({ ...prev, [clipId]: newOffset }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const exportMix = useCallback(async () => {
    // Simple approach: download each clip individually
    clips.forEach((clip, i) => {
      const a = document.createElement('a');
      a.href = clip.url;
      a.download = `muze-${clip.instrumentSlug}-${i + 1}.webm`;
      a.click();
    });
  }, [clips]);

  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4" style={{ color: 'var(--text-muted)' }}>
        <div className="text-5xl">🎼</div>
        <div className="text-lg font-medium" style={{ color: 'var(--text)' }}>No clips yet</div>
        <p className="text-sm text-center max-w-xs">
          Go to an instrument, play something, hit Record, then come back here.
        </p>
        <Link
          href="/instruments"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Music2 size={16} />
          Go to Instruments
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={playing ? stopPlayback : startPlayback}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {playing ? <><Square size={15} /> Stop</> : <><Play size={15} /> Play All</>}
        </button>

        <button
          onClick={exportMix}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)' }}
        >
          <Download size={15} />
          Export Clips
        </button>

        <button
          onClick={clearClips}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ml-auto"
          style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)' }}
        >
          <Trash2 size={15} />
          Clear All
        </button>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {/* Time ruler */}
        <div className="flex items-center border-b overflow-x-auto" style={{ borderColor: 'var(--border)', height: 32, background: 'var(--surface-2)' }}>
          <div className="w-36 shrink-0 px-4 text-xs" style={{ color: 'var(--text-dim)' }}>Track</div>
          <div className="relative" style={{ width: timelineWidth, height: 32 }}>
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, s) => (
              <div
                key={s}
                className="absolute top-0 h-full flex items-end pb-1"
                style={{ left: s * PX_PER_SEC }}
              >
                <div className="h-2 w-px" style={{ background: 'var(--border-2)' }} />
                <span className="ml-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>{s}s</span>
              </div>
            ))}
            {/* Playhead */}
            {playing && (
              <div
                className="absolute top-0 bottom-0 w-px z-10"
                style={{ left: currentTime * PX_PER_SEC, background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
              />
            )}
          </div>
        </div>

        {/* Tracks */}
        <div className="overflow-x-auto">
          {clips.map((clip) => {
            const offset = clipOffsets[clip.id] ?? 0;
            const clipWidth = Math.max(40, clip.duration * PX_PER_SEC);
            return (
              <div key={clip.id} className="flex items-center border-b" style={{ borderColor: 'var(--border)', height: TRACK_H }}>
                {/* Track label */}
                <div className="w-36 shrink-0 px-4 flex items-center gap-2">
                  <span>{clip.instrumentEmoji}</span>
                  <span className="text-xs font-medium truncate">{clip.instrumentName}</span>
                  <button
                    onClick={() => removeClip(clip.id)}
                    className="ml-auto opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--red)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Timeline lane */}
                <div className="relative flex-1 h-full" style={{ minWidth: timelineWidth }}>
                  {/* Grid lines */}
                  {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, s) => (
                    <div key={s} className="absolute top-0 bottom-0 w-px" style={{ left: s * PX_PER_SEC, background: 'var(--border)' }} />
                  ))}

                  {/* Clip block */}
                  <div
                    className="absolute top-2 bottom-2 rounded-lg flex items-center px-3 cursor-grab select-none"
                    style={{
                      left: offset * PX_PER_SEC,
                      width: clipWidth,
                      background: `${clip.color}30`,
                      border: `1px solid ${clip.color}60`,
                    }}
                    onMouseDown={(e) => handleDragStart(e, clip.id)}
                  >
                    <span className="text-xs font-medium truncate" style={{ color: clip.color }}>
                      {clip.instrumentEmoji} {clip.duration.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs" style={{ color: 'var(--text-dim)' }}>
        Drag clips left/right to reposition them on the timeline. Hit Play All to hear everything together.
      </div>
    </div>
  );
}

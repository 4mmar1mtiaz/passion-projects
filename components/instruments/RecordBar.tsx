'use client';

import { useState } from 'react';
import { Mic, Square, Send } from 'lucide-react';
import { useRecorder } from '@/lib/useRecorder';
import { useSession, CLIP_COLORS } from '@/lib/sessionContext';
import type { Instrument } from '@/lib/instruments';

export default function RecordBar({ instrument }: { instrument: Instrument }) {
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const { addClip, clips } = useSession();
  const [status, setStatus] = useState<'idle' | 'recording' | 'saved'>('idle');

  const handleRecord = async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result) {
        const url = URL.createObjectURL(result.blob);
        const color = CLIP_COLORS[clips.length % CLIP_COLORS.length];
        addClip({
          instrumentSlug: instrument.slug,
          instrumentName: instrument.name,
          instrumentEmoji: instrument.emoji,
          blob: result.blob,
          url,
          duration: result.duration,
          color,
        });
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } else {
      const ok = await startRecording();
      if (ok) setStatus('recording');
    }
  };

  return (
    <div className="flex items-center gap-3 mt-6 p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <button
        onClick={handleRecord}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: isRecording ? 'var(--red-dim)' : 'var(--accent-dim)',
          color: isRecording ? 'var(--red)' : 'var(--accent)',
          border: `1px solid ${isRecording ? 'var(--red)' : 'var(--accent)'}`,
        }}
      >
        {isRecording ? (
          <>
            <Square size={14} className="recording-pulse" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic size={14} />
            Record
          </>
        )}
      </button>

      {isRecording && (
        <span className="text-sm recording-pulse" style={{ color: 'var(--red)' }}>
          ● Recording...
        </span>
      )}

      {status === 'saved' && (
        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--green)' }}>
          <Send size={13} /> Clip saved to Composer
        </span>
      )}

      <span className="ml-auto text-xs" style={{ color: 'var(--text-dim)' }}>
        Mic access required to record
      </span>
    </div>
  );
}

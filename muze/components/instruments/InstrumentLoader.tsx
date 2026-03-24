'use client';

import dynamic from 'next/dynamic';
import type { Instrument } from '@/lib/instruments';

const Piano = dynamic(() => import('./Piano'), { ssr: false, loading: () => <Loader /> });
const Guitar = dynamic(() => import('./Guitar'), { ssr: false, loading: () => <Loader /> });
const Drums = dynamic(() => import('./Drums'), { ssr: false, loading: () => <Loader /> });
const Harmonium = dynamic(() => import('./Harmonium'), { ssr: false, loading: () => <Loader /> });
const Tabla = dynamic(() => import('./Tabla'), { ssr: false, loading: () => <Loader /> });
const GenericKeys = dynamic(() => import('./GenericKeys'), { ssr: false, loading: () => <Loader /> });

function Loader() {
  return (
    <div className="flex items-center justify-center h-64 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', opacity: 0.6, animation: `pulse-record 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

export default function InstrumentLoader({ instrument }: { instrument: Instrument }) {
  const props = { instrument };
  switch (instrument.component) {
    case 'Piano': return <Piano {...props} />;
    case 'Guitar': return <Guitar {...props} />;
    case 'Drums': return <Drums {...props} />;
    case 'Harmonium': return <Harmonium {...props} />;
    case 'Tabla': return <Tabla {...props} />;
    default: return <GenericKeys {...props} />;
  }
}

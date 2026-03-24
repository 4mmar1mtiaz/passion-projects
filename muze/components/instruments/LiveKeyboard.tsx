'use client';

// Physical keyboard layout — shows what every key does, lights up when pressed

const ROWS = [
  { id: 'num',  keys: ['1','2','3','4','5','6','7','8','9','0','-','='], label: 'Number row' },
  { id: 'q',    keys: ['q','w','e','r','t','y','u','i','o','p','[',']','\\'], label: 'Q row' },
  { id: 'a',    keys: ['a','s','d','f','g','h','j','k','l',';',"'"], label: 'A row' },
  { id: 'z',    keys: ['z','x','c','v','b','n','m',',','.','/'], label: 'Z row' },
];

export interface KeyInfo {
  note: string;       // e.g. "C4" or "Dha"
  color: string;      // bg color when active
  rowLabel?: string;  // e.g. "String 1"
  inactive?: boolean; // true = this key has no function (gray out)
}

interface LiveKeyboardProps {
  keyMap: Record<string, KeyInfo>;
  pressedKeys: Set<string>;
  title?: string;
  legend?: { color: string; label: string }[];
}

export default function LiveKeyboard({ keyMap, pressedKeys, title, legend }: LiveKeyboardProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title ?? 'Your Keyboard = Your Instrument'}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Keys light up as you play</div>
        </div>
        {legend && (
          <div className="flex flex-wrap gap-3">
            {legend.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard */}
      <div className="p-4 overflow-x-auto">
        <div className="space-y-1.5" style={{ minWidth: 580 }}>
          {ROWS.map((row, ri) => (
            <div key={row.id} className="flex gap-1" style={{ paddingLeft: ri === 1 ? 18 : ri === 2 ? 26 : ri === 3 ? 36 : 0 }}>
              {row.keys.map((key) => {
                const info = keyMap[key];
                const isPressed = pressedKeys.has(key);
                const hasNote = !!info && !info.inactive;

                return (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-between rounded-md transition-all select-none"
                    style={{
                      width: 42,
                      height: 52,
                      padding: '4px 3px',
                      background: isPressed
                        ? info?.color ?? 'var(--accent)'
                        : hasNote
                        ? `${info.color}22`
                        : 'var(--surface-2)',
                      border: isPressed
                        ? `2px solid ${info?.color ?? 'var(--accent)'}`
                        : hasNote
                        ? `1px solid ${info.color}55`
                        : '1px solid var(--border)',
                      boxShadow: isPressed ? `0 0 14px ${info?.color ?? 'var(--accent)'}80` : 'none',
                      transform: isPressed ? 'scale(0.92) translateY(2px)' : 'scale(1)',
                      opacity: hasNote ? 1 : 0.3,
                    }}
                  >
                    <span
                      className="text-[9px] font-bold leading-none font-mono"
                      style={{ color: isPressed ? '#fff' : hasNote ? info.color : 'var(--text-dim)' }}
                    >
                      {key === '\\' ? '\\' : key === ';' ? ';' : key === "'" ? "'" : key.toUpperCase()}
                    </span>
                    {hasNote && (
                      <span
                        className="text-[8px] leading-none text-center font-semibold"
                        style={{ color: isPressed ? '#fff' : 'var(--text-muted)', maxWidth: 38, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {info.note}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

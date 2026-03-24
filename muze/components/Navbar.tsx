'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/sessionContext';
import { Music2, BookOpen, Layers, Plus, ChevronDown, Check, Trash2, FolderOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const NAV = [
  { href: '/instruments', label: 'Instruments', icon: Music2 },
  { href: '/composer', label: 'Composer', icon: Layers },
  { href: '/learn', label: 'Learn', icon: BookOpen },
];

export default function Navbar() {
  const path = usePathname();
  const { projects, activeProject, clips, createProject, switchProject, deleteProject } = useSession();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (creating) inputRef.current?.focus(); }, [creating]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim());
    setNewName('');
    setCreating(false);
    setOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-5 h-14 gap-4"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <Link href="/" className="font-black text-xl tracking-tighter shrink-0" style={{ color: 'var(--accent)', letterSpacing: '-0.04em' }}>
        muze
      </Link>

      {/* Project switcher */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }}
        >
          <FolderOpen size={13} style={{ color: 'var(--accent)' }} />
          <span className="max-w-[140px] truncate">{activeProject?.name ?? 'Select Project'}</span>
          {clips.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {clips.length}
            </span>
          )}
          <ChevronDown size={12} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>

        {open && (
          <div
            className="absolute top-full mt-2 left-0 rounded-xl overflow-hidden shadow-2xl z-50"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', width: 260 }}
          >
            <div className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-dim)' }}>
              Projects
            </div>

            <div className="max-h-52 overflow-y-auto">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all group"
                  style={{ background: p.id === activeProject?.id ? 'var(--accent-dim)' : 'transparent' }}
                  onClick={() => { switchProject(p.id); setOpen(false); }}
                >
                  <Check size={13} style={{ color: 'var(--accent)', opacity: p.id === activeProject?.id ? 1 : 0 }} />
                  <span className="flex-1 text-sm truncate">{p.name}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                    {p.clips.length} clips
                  </span>
                  {projects.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                      style={{ color: 'var(--red)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t p-2" style={{ borderColor: 'var(--border)' }}>
              {creating ? (
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                    placeholder="Project name..."
                    className="flex-1 text-sm px-2 py-1.5 rounded-lg outline-none"
                    style={{ background: 'var(--border)', color: 'var(--text)', border: '1px solid var(--border-2)' }}
                  />
                  <button
                    onClick={handleCreate}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{ color: 'var(--accent)' }}
                >
                  <Plus size={14} />
                  New Project
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1 ml-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                color: active ? '#fff' : 'var(--text-muted)',
                background: active ? 'var(--accent)' : 'transparent',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

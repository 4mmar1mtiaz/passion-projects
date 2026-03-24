'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface Clip {
  id: string;
  instrumentSlug: string;
  instrumentName: string;
  instrumentEmoji: string;
  blob: Blob;
  url: string;
  duration: number;
  createdAt: number;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  clips: Clip[];
}

interface SessionContextType {
  projects: Project[];
  activeProjectId: string;
  activeProject: Project;
  clips: Clip[]; // shorthand for activeProject.clips
  createProject: (name: string) => string;
  switchProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  addClip: (clip: Omit<Clip, 'id' | 'createdAt'>) => void;
  removeClip: (id: string) => void;
  clearClips: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const CLIP_COLORS = [
  '#6e56ff', '#ff6b6b', '#4ade80', '#fbbf24',
  '#38bdf8', '#f472b6', '#a78bfa', '#34d399',
];

function makeProject(name: string): Project {
  return { id: `proj-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, name, createdAt: Date.now(), clips: [] };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => [makeProject('My First Project')]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  // Set active to first project on mount
  useEffect(() => {
    setProjects((prev) => { setActiveProjectId(prev[0].id); return prev; });
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const clips = activeProject?.clips ?? [];

  const createProject = useCallback((name: string) => {
    const p = makeProject(name);
    setProjects((prev) => [...prev, p]);
    setActiveProjectId(p.id);
    return p.id;
  }, []);

  const switchProject = useCallback((id: string) => setActiveProjectId(id), []);

  const renameProject = useCallback((id: string, name: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, name } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (remaining.length === 0) {
        const fresh = makeProject('New Project');
        setActiveProjectId(fresh.id);
        return [fresh];
      }
      if (id === activeProjectId) setActiveProjectId(remaining[0].id);
      return remaining;
    });
  }, [activeProjectId]);

  const updateActiveClips = useCallback((fn: (clips: Clip[]) => Clip[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, clips: fn(p.clips) } : p
      )
    );
  }, [activeProjectId]);

  const addClip = useCallback((clip: Omit<Clip, 'id' | 'createdAt'>) => {
    const id = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    updateActiveClips((prev) => [...prev, { ...clip, id, createdAt: Date.now() }]);
  }, [updateActiveClips]);

  const removeClip = useCallback((id: string) => {
    updateActiveClips((prev) => {
      const clip = prev.find((c) => c.id === id);
      if (clip) URL.revokeObjectURL(clip.url);
      return prev.filter((c) => c.id !== id);
    });
  }, [updateActiveClips]);

  const clearClips = useCallback(() => {
    updateActiveClips((prev) => { prev.forEach((c) => URL.revokeObjectURL(c.url)); return []; });
  }, [updateActiveClips]);

  return (
    <SessionContext.Provider value={{
      projects, activeProjectId: activeProject?.id ?? '', activeProject: activeProject ?? projects[0],
      clips, createProject, switchProject, renameProject, deleteProject,
      addClip, removeClip, clearClips,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}

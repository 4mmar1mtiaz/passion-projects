'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  getAllProjects, getClipsByProject,
  putProject, deleteProject as dbDeleteProject,
  putClip, deleteClip, clearProjectClips,
} from './db';

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
  clips: Clip[];
  dbLoaded: boolean;
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
  return { id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, createdAt: Date.now(), clips: [] };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [dbLoaded, setDbLoaded] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const dbProjects = await getAllProjects();
        if (dbProjects.length === 0) {
          // First visit — create default project
          const fresh = makeProject('My First Project');
          await putProject({ id: fresh.id, name: fresh.name, createdAt: fresh.createdAt });
          setProjects([fresh]);
          setActiveProjectId(fresh.id);
        } else {
          // Hydrate projects + their clips
          const loaded: Project[] = await Promise.all(
            dbProjects.map(async (p) => {
              const dbClips = await getClipsByProject(p.id);
              const clips: Clip[] = dbClips.map((c) => ({
                id: c.id,
                instrumentSlug: c.instrumentSlug,
                instrumentName: c.instrumentName,
                instrumentEmoji: c.instrumentEmoji,
                blob: c.blob,
                url: URL.createObjectURL(c.blob),
                duration: c.duration,
                createdAt: c.createdAt,
                color: c.color,
              }));
              return { id: p.id, name: p.name, createdAt: p.createdAt, clips };
            })
          );
          // Sort by createdAt
          loaded.sort((a, b) => a.createdAt - b.createdAt);
          setProjects(loaded);
          setActiveProjectId(loaded[0].id);
        }
      } catch (e) {
        // IndexedDB unavailable (private browsing etc.) — fall back to in-memory
        const fresh = makeProject('My First Project');
        setProjects([fresh]);
        setActiveProjectId(fresh.id);
        console.warn('IndexedDB unavailable, using in-memory storage', e);
      }
      setDbLoaded(true);
    })();
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const clips = activeProject?.clips ?? [];

  const createProject = useCallback((name: string) => {
    const p = makeProject(name);
    setProjects((prev) => [...prev, p]);
    setActiveProjectId(p.id);
    putProject({ id: p.id, name: p.name, createdAt: p.createdAt }).catch(console.error);
    return p.id;
  }, []);

  const switchProject = useCallback((id: string) => setActiveProjectId(id), []);

  const renameProject = useCallback((id: string, name: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => p.id === id ? { ...p, name } : p);
      const p = updated.find((p) => p.id === id);
      if (p) putProject({ id: p.id, name: p.name, createdAt: p.createdAt }).catch(console.error);
      return updated;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (remaining.length === 0) {
        const fresh = makeProject('New Project');
        putProject({ id: fresh.id, name: fresh.name, createdAt: fresh.createdAt }).catch(console.error);
        setActiveProjectId(fresh.id);
        return [fresh];
      }
      if (id === activeProjectId) setActiveProjectId(remaining[0].id);
      return remaining;
    });
    dbDeleteProject(id).catch(console.error);
  }, [activeProjectId]);

  const updateActiveClips = useCallback((fn: (clips: Clip[]) => Clip[]) => {
    setProjects((prev) =>
      prev.map((p) => p.id === activeProjectId ? { ...p, clips: fn(p.clips) } : p)
    );
  }, [activeProjectId]);

  const addClip = useCallback((clip: Omit<Clip, 'id' | 'createdAt'>) => {
    const id = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = Date.now();
    const newClip: Clip = { ...clip, id, createdAt };
    updateActiveClips((prev) => [...prev, newClip]);
    putClip({
      id, projectId: activeProjectId,
      instrumentSlug: clip.instrumentSlug,
      instrumentName: clip.instrumentName,
      instrumentEmoji: clip.instrumentEmoji,
      blob: clip.blob, duration: clip.duration,
      createdAt, color: clip.color,
    }).catch(console.error);
  }, [updateActiveClips, activeProjectId]);

  const removeClip = useCallback((id: string) => {
    updateActiveClips((prev) => {
      const clip = prev.find((c) => c.id === id);
      if (clip) URL.revokeObjectURL(clip.url);
      return prev.filter((c) => c.id !== id);
    });
    deleteClip(id).catch(console.error);
  }, [updateActiveClips]);

  const clearClips = useCallback(() => {
    updateActiveClips((prev) => { prev.forEach((c) => URL.revokeObjectURL(c.url)); return []; });
    clearProjectClips(activeProjectId).catch(console.error);
  }, [updateActiveClips, activeProjectId]);

  return (
    <SessionContext.Provider value={{
      projects, activeProjectId: activeProject?.id ?? '',
      activeProject: activeProject ?? projects[0],
      clips, dbLoaded,
      createProject, switchProject, renameProject, deleteProject,
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

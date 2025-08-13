import { create } from 'zustand';

export interface Directory {
  [key: string]: string | Directory;
}

// Default seed FS
export const defaultFilesystem: Directory = {
  '~': {
    'about.txt': 'This is a portfolio website designed to look like a terminal.',
    'projects': {
      'glitch-app.txt': 'glitch.app — See more: /blog/glitch-house',
      'README.txt': 'Open with Notes for links to blog and assets.'
    },
    'socials.txt': 'You can find me on:\n- GitHub: ...\n- LinkedIn: ...',
    'notes': {
      'glitch.md': 'This is my recent project.\n\n- Open the blog inside OS: <a href="/blog/glitch-house">Open in Browser App</a>\n- Open in new tab: <a href="/blog/glitch-house" target="_blank" rel="noopener noreferrer">glitch.house blog</a>\n',
    },
  },
};

export type Filesystem = Directory;

type FilesystemStore = {
  fs: Directory;
  setFs: (next: Directory) => void;
  readDir: (path: string[]) => Directory | null;
  readFile: (path: string[]) => string | null;
  writeFile: (path: string[], content: string) => void;
  mkdir: (path: string[]) => void;
  exists: (path: string[]) => boolean;
  isDir: (path: string[]) => boolean;
  isFile: (path: string[]) => boolean;
  persist: () => void;
  hydrate: () => void;
};

const LS_KEY = 'vfs_v1';

export const useFilesystem = create<FilesystemStore>((set, get) => ({
  fs: defaultFilesystem,
  setFs: (next) => { set({ fs: next }); get().persist(); },
  readDir: (path) => {
    let current: Directory | string = get().fs;
    for (const segment of path) {
      if (typeof current !== 'object') return null;
      current = current[segment];
      if (current === undefined) return null;
    }
    return typeof current === 'object' ? current as Directory : null;
  },
  readFile: (path) => {
    let current: Directory | string = get().fs;
    const last = path[path.length - 1];
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      if (typeof current !== 'object') return null;
      current = current[segment];
      if (current === undefined) return null;
    }
    if (typeof current !== 'object') return null;
    const value = current[last];
    return typeof value === 'string' ? value : null;
  },
  writeFile: (path, content) => {
    set(state => {
      const next = structuredClone(state.fs);
      let cursor: Directory | string = next;
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (typeof cursor !== 'object') break;
        if (!cursor[segment]) cursor[segment] = {};
        cursor = cursor[segment];
      }
      const parent = cursor as Directory;
      parent[path[path.length - 1]] = content;
      const updated = next as Directory;
      return { fs: updated };
    });
    get().persist();
  },
  mkdir: (path) => {
    set(state => {
      const next = structuredClone(state.fs);
      let cursor: Directory | string = next;
      for (const segment of path) {
        if (typeof cursor !== 'object') break;
        if (!cursor[segment]) cursor[segment] = {};
        cursor = cursor[segment];
      }
      return { fs: next };
    });
    get().persist();
  },
  exists: (path) => {
    let current: Directory | string = get().fs;
    for (const segment of path) {
      if (typeof current !== 'object') return false;
      current = current[segment];
      if (current === undefined) return false;
    }
    return true;
  },
  isDir: (path) => {
    let current: Directory | string = get().fs;
    for (const segment of path) {
      if (typeof current !== 'object') return false;
      current = current[segment];
      if (current === undefined) return false;
    }
    return typeof current === 'object';
  },
  isFile: (path) => {
    let current: Directory | string = get().fs;
    const last = path[path.length - 1];
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      if (typeof current !== 'object') return false;
      current = current[segment];
      if (current === undefined) return false;
    }
    if (typeof current !== 'object') return false;
    return typeof current[last] === 'string';
  },
  persist: () => {
    try {
      const { fs } = get();
      localStorage.setItem(LS_KEY, JSON.stringify(fs));
    } catch {
      // ignore
    }
  },
  hydrate: () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ fs: parsed });
      }
    } catch {
      // ignore, keep defaults
    }
    // Also try to hydrate from static API (generated at build time)
    try {
      // Fire-and-forget; no need to await
      void (async () => {
        const res = await fetch('/api/vfs');
        if (!res.ok) return;
        const fromServer = await res.json();
        set({ fs: fromServer });
        get().persist();
      })();
    } catch {
      // ignore network errors (e.g., during static export)
    }
  }
}));

// Hydrate on load in browser
if (typeof window !== 'undefined') {
  try { useFilesystem.getState().hydrate(); } catch { /* noop */ }
}

// Backward-compat export for any leftover imports
export const filesystem: Directory = defaultFilesystem;
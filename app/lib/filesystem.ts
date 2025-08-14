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
  // Snapshot of the bundled, read-only filesystem shipped with the app (from /api/vfs)
  seedFs: Directory | null;
  setFs: (next: Directory) => void;
  readDir: (path: string[]) => Directory | null;
  readFile: (path: string[]) => string | null;
  writeFile: (path: string[], content: string) => void;
  mkdir: (path: string[]) => void;
  exists: (path: string[]) => boolean;
  isDir: (path: string[]) => boolean;
  isFile: (path: string[]) => boolean;
  // Returns true if the given path points to a file that comes from the bundled VFS (read-only)
  isBundledFile: (path: string[]) => boolean;
  persist: () => void;
  hydrate: () => void;
};

const LS_KEY = 'vfs_overlay_v1';

export const useFilesystem = create<FilesystemStore>((set, get) => ({
  fs: defaultFilesystem,
  seedFs: null,
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
  isBundledFile: (path) => {
    const seed = get().seedFs;
    if (!seed) return false;
    let current: Directory | string = seed;
    const last = path[path.length - 1];
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      if (typeof current !== 'object') return false;
      current = (current as Directory)[segment];
      if (current === undefined) return false;
    }
    if (typeof current !== 'object') return false;
    return typeof (current as Directory)[last] === 'string';
  },
  persist: () => {
    try {
      const { fs, seedFs } = get();
      // Only persist user-created content (keys not present in seedFs)
      const keepOnlyExtras = (current: Directory, seed: Directory | null): Directory => {
        const result: Directory = {};
        for (const key of Object.keys(current)) {
          const currVal = current[key];
          const seedVal = seed ? (seed as Directory)[key] : undefined;
          if (seed && seedVal !== undefined) {
            if (typeof currVal === 'object' && typeof seedVal === 'object') {
              const child = keepOnlyExtras(currVal as Directory, seedVal as Directory);
              if (Object.keys(child).length > 0) result[key] = child;
            }
            // If exists in seed as file or equal dir, skip persisting
          } else {
            result[key] = currVal;
          }
        }
        return result;
      };
      const overlay = keepOnlyExtras(fs, seedFs);
      localStorage.setItem(LS_KEY, JSON.stringify(overlay));
    } catch {
      // ignore
    }
  },
  hydrate: () => {
    // Try to load local overlay (user-created files only)
    let overlay: Directory = {};
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) overlay = JSON.parse(raw);
    } catch {
      // ignore
    }
    // Fetch server snapshot and merge overlay in (server wins)
    try {
      void (async () => {
        try {
          const res = await fetch('/api/vfs');
          if (!res.ok) throw new Error('failed');
          const fromServer = await res.json() as Directory;
          const mergeWithoutOverwrite = (base: Directory, over: Directory): Directory => {
            const result: Directory = structuredClone(base);
            const mergeDir = (target: Directory, overlayDir: Directory) => {
              for (const key of Object.keys(overlayDir)) {
                const overVal = overlayDir[key];
                const targetVal = target[key];
                if (targetVal === undefined) {
                  target[key] = overVal;
                } else if (typeof targetVal === 'object' && typeof overVal === 'object') {
                  mergeDir(targetVal as Directory, overVal as Directory);
                }
              }
            };
            mergeDir(result, over);
            return result;
          };
          const mergedFs = mergeWithoutOverwrite(fromServer, overlay);
          set({ fs: mergedFs, seedFs: fromServer });
          get().persist();
        } catch {
          // Fallback: merge overlay onto default seed
          const mergedFallback = (() => {
            const merge = (base: Directory, over: Directory): Directory => {
              const result: Directory = structuredClone(base);
              const mergeDir = (target: Directory, overlayDir: Directory) => {
                for (const key of Object.keys(overlayDir)) {
                  const overVal = overlayDir[key];
                  const targetVal = target[key];
                  if (targetVal === undefined) {
                    target[key] = overVal;
                  } else if (typeof targetVal === 'object' && typeof overVal === 'object') {
                    mergeDir(targetVal as Directory, overVal as Directory);
                  }
                }
              };
              mergeDir(result, over);
              return result;
            };
            return merge(defaultFilesystem, overlay);
          })();
          set({ fs: mergedFallback, seedFs: defaultFilesystem });
          get().persist();
        }
      })();
    } catch {
      // ignore
    }
  }
}));

// Hydrate on load in browser
if (typeof window !== 'undefined') {
  try { useFilesystem.getState().hydrate(); } catch { /* noop */ }
}

// Backward-compat export for any leftover imports
export const filesystem: Directory = defaultFilesystem;
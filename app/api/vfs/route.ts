import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// The virtual filesystem lives under the project root in the `vfs/` folder.
// We recursively read it and return an object where directories are objects and files are string contents.

type VfsNode = string | { [key: string]: VfsNode };

function readVfsDirectory(dirPath: string): VfsNode {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const node: { [key: string]: VfsNode } = {};
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      node[entry.name] = readVfsDirectory(fullPath);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      node[entry.name] = content;
    }
  }
  return node;
}

export async function GET() {
  try {
    // Root of the VFS is a single home directory '~'
    const vfsRoot = path.join(process.cwd(), 'vfs');
    const fsObject: VfsNode = { '~': {} };
    if (fs.existsSync(vfsRoot)) {
      // Place contents of vfs/ into '~'
      (fsObject as { [key: string]: VfsNode })['~'] = readVfsDirectory(vfsRoot);
    }
    return NextResponse.json(fsObject);
  } catch {
    return NextResponse.json({ error: 'Failed to read VFS' }, { status: 500 });
  }
}

// Tell Next.js to pre-render this at build time and run in the Node runtime
export const dynamic = 'force-static';
export const runtime = 'nodejs';



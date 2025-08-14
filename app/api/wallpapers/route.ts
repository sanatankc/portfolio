import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'wallpapers');
    let files: string[] = [];
    try {
      files = fs.readdirSync(dir);
    } catch {
      files = [];
    }

    const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
    const images = files
      .filter((f) => allowed.has(path.extname(f).toLowerCase()))
      .map((f) => `/wallpapers/${encodeURIComponent(f)}`);

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}



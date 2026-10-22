// app/api/images/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export async function GET() {
  const imagesDir = path.join(process.cwd(), 'public/image');
  let files;
  try {
    files = fs.readdirSync(imagesDir);
  } catch {
    return NextResponse.json({ images: [], error: 'Directory not found' }, { status: 500 });
  }

  const imagePaths = files
    .filter(file => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    })
    .map(file => `/image/${file}`);

  console.log('Fetched image paths:', imagePaths);

  return NextResponse.json({ images: imagePaths });
}

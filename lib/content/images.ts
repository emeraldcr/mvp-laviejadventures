// lib/getImages.ts
import fs from 'fs';
import path from 'path';

export function getImages() {
  const imagesDir = path.join(process.cwd(), 'public/image');
  const files = fs.readdirSync(imagesDir);
  const imagePaths = files
    .filter(file => file.endsWith('.jpg')) 
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    })
    .map(file => `/image/${file}`);
  
  return imagePaths;
}
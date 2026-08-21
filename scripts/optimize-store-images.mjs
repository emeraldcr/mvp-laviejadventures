import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const storeDirectory = path.resolve("public/store");
const files = (await readdir(storeDirectory)).filter((file) => file.endsWith(".png"));

await Promise.all(
  files.map(async (file) => {
    const source = path.join(storeDirectory, file);
    const destination = path.join(storeDirectory, file.replace(/\.png$/, ".webp"));

    await sharp(source)
      .webp({ quality: 84, smartSubsample: true })
      .toFile(destination);
  }),
);

console.log(`Optimized ${files.length} store images.`);

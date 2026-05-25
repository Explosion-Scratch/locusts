import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

const HOME_DIR = os.homedir();
const SOURCE_DIR_LEFT = path.join(HOME_DIR, 'Downloads', 'locusts', 'left');
const SOURCE_DIR_RIGHT = path.join(HOME_DIR, 'Downloads', 'locusts', 'right');

const TARGET_DIR_LEFT = path.join(process.cwd(), 'src', 'assets', 'locusts', 'left');
const TARGET_DIR_RIGHT = path.join(process.cwd(), 'src', 'assets', 'locusts', 'right');

async function processDirectory(sourceDir: string, targetDir: string) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory ${sourceDir} does not exist. Skipping.`);
    return;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.startsWith('.') || !file.endsWith('.png')) {
      continue;
    }

    const inputPath = path.join(sourceDir, file);
    // Give output files simpler names like locust-1.png, etc.
    const outputPath = path.join(targetDir, `locust-${i + 1}.png`);

    try {
      await sharp(inputPath)
        .trim({ threshold: 0 }) // Trims transparent pixels by default
        .resize({ width: 256 })
        .toFile(outputPath);
      console.log(`Processed ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

async function main() {
  console.log('Processing left locusts...');
  await processDirectory(SOURCE_DIR_LEFT, TARGET_DIR_LEFT);

  console.log('\nProcessing right locusts...');
  await processDirectory(SOURCE_DIR_RIGHT, TARGET_DIR_RIGHT);

  console.log('\nImage processing complete!');
}

main().catch(console.error);

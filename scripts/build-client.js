import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('--- PlaceWise Vercel Production Build ---');

// 1. Install client dependencies
console.log('1. Installing client dependencies...');
execSync('npm --prefix client install', { stdio: 'inherit' });

// 2. Build Vite frontend
console.log('2. Building Vite frontend...');
execSync('npm --prefix client run build', { stdio: 'inherit' });

// 3. Ensure root dist directory exists and copy client/dist to root dist
const clientDist = path.resolve('client', 'dist');
const rootDist = path.resolve('dist');

if (fs.existsSync(clientDist)) {
  console.log('3. Copying client/dist to root dist for Vercel...');
  if (fs.existsSync(rootDist)) {
    fs.rmSync(rootDist, { recursive: true, force: true });
  }
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log('✓ Successfully created root dist for Vercel!');
} else {
  console.error('Error: client/dist not found after build!');
  process.exit(1);
}

console.log('--- PlaceWise Build Complete ---');
